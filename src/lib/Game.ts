import { Bishop } from "./pieces/Bishop";
import { King } from "./pieces/King";
import { Knight } from "./pieces/Knight";
import { Pawn } from "./pieces/Pawn";
import { Piece, Position } from "./pieces/Piece";
import { Queen } from "./pieces/Queen";
import { Rook } from "./pieces/Rook";

const Pieces: { [key: string]: typeof Piece } = {
	R: Rook,
	N: Knight,
	B: Bishop,
	Q: Queen,
	K: King,
	P: Pawn,
};

export const StartFen: string =
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const Columns: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const Rows: string[] = ["8", "7", "6", "5", "4", "3", "2", "1"];

export class Game {
	private updateState: () => void;
	board: (Piece | undefined)[][] = [];
	highlitedSquares: Position[] = [];
	selectedPiece: Piece | undefined;
	currentMove: "b" | "w" = "w";
	checked: boolean = false;
	// TODO: make en passent work
	enPassentPossible: Position | undefined;
	halfMoveClock: number = 0;
	fullMoveClock: number = 1;
	fen: string = "";

	previousMove: Position[] = [];

	gameOver: boolean = false;
	checkmate: boolean = false;
	draw: boolean = false;
	drawReason: string = "stalemate";

	isClone: boolean = false;

	constructor(updateState: () => void, clone: boolean = false) {
		this.isClone = clone;

		this.updateState = updateState;
		this.generateGameBoard();
		this.loadFen(StartFen);
		this.generatefen();
	}

	generatefen(): string {
		let fen = "";

		this.board.forEach((row, index) => {
			if (index > 0) {
				fen += "/";
			}

			let empty = 0;

			row.forEach((piece) => {
				if (piece) {
					if (empty > 0) {
						fen += empty.toString();
					}

					empty = 0;

					fen +=
						piece.color === "w"
							? piece.identifier
							: piece.identifier.toLowerCase();
				} else {
					empty += 1;
				}
			});

			if (empty > 0) {
				fen += empty.toString();
			}
		});

		fen += ` ${this.currentMove} `;

		const whiteKing = this.findKing("w");
		const blackKing = this.findKing("b");

		const whiteCastleRights = whiteKing.castleRights();
		const blackCastleRights = blackKing.castleRights();

		if ([...whiteCastleRights, ...blackCastleRights].some((v) => v)) {
			fen += `${whiteCastleRights[0] ? "Q" : ""}${
				whiteCastleRights[1] ? "K" : ""
			}${blackCastleRights[0] ? "q" : ""}${
				blackCastleRights[1] ? "k" : ""
			} `;
		} else {
			fen += `- `;
		}

		fen += `${this.positionToString(this.enPassentPossible) || "-"} `;

		fen += `${this.halfMoveClock} ${this.fullMoveClock}`;

		this.fen = fen;

		this.updateState();

		return fen;
	}

	loadBoardFen(board: string) {
		this.generateGameBoard();

		const rows = board.split("/");

		if (rows.length !== 8) throw Error("Invalid Fen - Not enough rows");

		rows.forEach((row, rowIndex) => {
			let toSkip = 0;
			let pieceIndex = 0;

			for (let i = 0; i < 8; i++) {
				const p = row[pieceIndex];

				if (toSkip > 0) {
					toSkip--;
					continue;
				}

				if (!isNaN(parseInt(p))) {
					toSkip = parseInt(p) - 1;
					pieceIndex++;
					continue;
				}

				const piece = Pieces[p.toUpperCase()];

				try {
					this.board[rowIndex][i] = new piece(
						[rowIndex, i],
						p.toUpperCase() === p ? "w" : "b",
						this
					);
				} catch {
					console.error("piece: ", p);
				}
				pieceIndex++;
			}

			if (pieceIndex !== row.length) {
				throw Error(`Invalid row, row index: ${rowIndex}`);
			}
		});
	}

	loadFen(fen: string) {
		const [board, move, castleRights, enPassent, halfMove, fullMove] =
			fen.split(" ");

		if (move !== "w" && move !== "b") {
			throw Error("Invalid move in fen");
		}

		if (castleRights !== "-" && !/^[QKqk]+$/.test(castleRights)) {
			throw Error("Invalid castle rights in fen");
		}

		if (isNaN(parseInt(halfMove)) || isNaN(parseInt(fullMove))) {
			throw Error("Half move or full move in fen not valid");
		}

		this.loadBoardFen(board);
		this.currentMove = move;

		if (enPassent !== "-") {
			this.enPassentPossible = this.stringToPosition(enPassent);
		} else {
			this.enPassentPossible = undefined;
		}

		this.halfMoveClock = parseInt(halfMove);
		this.fullMoveClock = parseInt(fullMove);

		this.getValidSquares();

		this.generatefen();

		this.previousMove = [];
		this.checked = this.isInCheck(this.currentMove);

		this.draw = false;
		this.gameOver = false;

		this.checkmate = !this.hasValidMoves() && this.checked;

		if (!this.hasValidMoves() && !this.checked) {
			this.draw = true;
			this.drawReason = "stalemate";
		}

		if (this.halfMoveClock >= 100) {
			this.draw = true;
			this.drawReason = "50 move rule";
		}

		this.gameOver = this.checkmate || this.draw;

		this.updateState();
	}

	stringToPosition(s: string): Position {
		if (s.length !== 2) {
			throw Error(`${s} is not a valid position`);
		}

		const c = Columns.indexOf(s[0]);
		const r = Rows.indexOf(s[1]);

		if (!c || !r) {
			throw Error(`${s} not found either column or row`);
		}

		return [r, c];
	}

	positionToString(pos: Position | undefined): string {
		if (!pos) return "";

		return `${Columns[pos[1]]}${Rows[pos[0]]}`;
	}

	generateGameBoard() {
		this.board = [];

		for (let y = 0; y < 8; y++) {
			const row: undefined[] = [];

			for (let x = 0; x < 8; x++) {
				row.push(undefined);
			}

			this.board.push(row);
		}
	}

	getValidSquares() {
		this.board.forEach((row) => {
			row.forEach((piece) => {
				if (piece) {
					piece.getValidSquares();
				}
			});
		});
	}

	movePiece(
		fromPos: Position,
		toPos: Position,
		fromMainBoard: boolean = true
	) {
		if (this.gameOver) return;

		let piece: Piece | undefined = this.getSquare(fromPos);

		if (piece === undefined) {
			console.error(`From piece is not at ${fromPos}`);
			this.selectPiece(undefined);
			return;
		}

		this.selectPiece(undefined);

		if (fromMainBoard && this.moveMakeCheck(fromPos, toPos)) {
			return;
		}

		const isCapture = this.getSquare(toPos) !== undefined;

		if (!piece.moveTo(toPos)) {
			return;
		}

		this.enPassentPossible = undefined;

		if (!isCapture && piece.identifier !== "P") {
			this.halfMoveClock += 1;
		} else {
			this.halfMoveClock = 0;
		}

		if (piece.identifier === "P" && Math.abs(fromPos[0] - toPos[0]) === 2) {
			this.enPassentPossible = [
				fromPos[0] - (fromPos[0] - toPos[0]) / 2,
				toPos[1],
			];
			console.log(this.enPassentPossible);
		}

		if (
			piece.identifier === "P" &&
			this.canPawnPromote(piece.position[0], piece.color)
		) {
			piece = new Queen(piece.position, piece.color, this);
			this.board[piece.position[0]][piece.position[1]] = piece;
		}

		this.currentMove = this.currentMove === "w" ? "b" : "w";

		this.getValidSquares();

		if (this.currentMove === "w") {
			this.fullMoveClock += 1;
		}

		this.previousMove = [fromPos, toPos];

		this.checked = this.isInCheck(this.currentMove);

		this.checkmate = !this.hasValidMoves() && this.checked;

		if (!this.hasValidMoves() && !this.checked) {
			this.draw = true;
			this.drawReason = "stalemate";
		}

		if (this.halfMoveClock >= 100) {
			this.draw = true;
			this.drawReason = "50 move rule";
		}

		this.gameOver = this.checkmate || this.draw;

		this.generatefen();

		this.updateState();
	}

	private canPawnPromote(yPos: number, color: "w" | "b"): boolean {
		return (color === "w" && yPos === 0) || (color === "b" && yPos === 7);
	}

	moveMakeCheck(
		fromPos: Position,
		toPos: Position,
		col: "w" | "b" = this.currentMove
	): boolean {
		const gameClone = new Game(() => {}, true);

		gameClone.loadFen(this.generatefen());
		gameClone.currentMove = col;
		gameClone.checked = this.checked;

		console.log(gameClone.board, this.generatefen(), fromPos, toPos, col);

		gameClone.getValidSquares();

		try {
			gameClone.movePiece(fromPos, toPos, false);

			if (gameClone.isInCheck(this.currentMove)) {
				return true;
			}
		} catch (e) {
			console.warn(e);
			return false;
		}

		return false;
	}

	hasValidMoves(): boolean {
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const pos: Position = [row, col];

				const piece = this.getSquare(pos);

				if (!piece || piece.color !== this.currentMove) {
					continue;
				}

				if (piece.validSquares.length > 0) {
					return true;
				}
			}
		}

		return false;
	}

	selectPiece(piece: Piece | undefined) {
		this.selectedPiece = piece;
		this.highlitedSquares = piece ? piece.validSquares : [];

		if (piece) {
			this.highlitedSquares = this.highlitedSquares
				.map((sq) =>
					this.moveMakeCheck(piece.position, sq) ? undefined : sq
				)
				.filter((eq) => eq !== undefined);
		}

		this.updateState();
	}

	getSquare([y, x]: Position) {
		if (!this.isPosInBounds([y, x])) {
			return undefined;
		}

		return this.board[y][x];
	}

	public selectSquare(position: Position) {
		const piece: Piece | undefined = this.getSquare(position);

		if (!piece) {
			if (this.selectedPiece) {
				this.movePiece(this.selectedPiece.position, position);
			}

			return;
		}

		if (this.selectedPiece) {
			if (this.selectedPiece.color === piece.color) {
				this.selectPiece(piece);
			} else {
				this.movePiece(this.selectedPiece.position, piece.position);
			}

			return;
		}

		if (piece && piece.color === this.currentMove) {
			this.selectPiece(piece);
			return;
		}

		this.selectPiece(undefined);
	}

	isSquareAttacked(position: Position, color: "w" | "b") {
		if (!this.isPosInBounds(position)) return false;

		let attacked = false;

		this.board.forEach((row) => {
			if (attacked) return;

			row.forEach((square) => {
				if (attacked || !square) return;

				if (square.color === color) return;

				if (
					square.attackingSquares.some(
						(square) =>
							square[0] === position[0] &&
							square[1] === position[1]
					)
				) {
					attacked = true;
					return;
				}
			});
		});

		return attacked;
	}

	findKing(color: "w" | "b"): King {
		for (const row of this.board) {
			for (const piece of row) {
				if (!piece) continue;

				if (piece instanceof King && piece.color === color)
					return piece;
			}
		}

		throw Error(`${color} king not found!`);
	}

	isInCheck(color: "w" | "b") {
		const king = this.findKing(color);

		return this.isSquareAttacked(king.position, color);
	}

	isPosInBounds(position: Position): boolean {
		return (
			position[0] < this.board.length &&
			position[0] >= 0 &&
			position[1] >= 0 &&
			position[1] < this.board[position[0]].length
		);
	}
}
