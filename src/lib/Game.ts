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

	moves: string[][] = [];

	boardHistory: string[] = [];
	viewingBoardHistory: boolean = false;

	constructor(updateState: () => void, clone: boolean = false) {
		this.isClone = clone;

		this.updateState = updateState;
		this.restart();
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

	restart(fen: string = StartFen) {
		this.moves = [];
		this.boardHistory = [];
		this.viewingBoardHistory = false;
		this.previousMove = [];
		this.generateGameBoard();
		this.loadFen(fen);
		this.updateState();
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

		if (c === undefined || r === undefined) {
			throw Error(
				`${s} not found either column or row ${
					c === undefined && r === undefined
						? "not found either"
						: c === undefined
						? "not found col"
						: "not found row"
				}`
			);
		}

		return [r, c];
	}

	positionToString(pos: Position | undefined): string {
		if (!pos) return "";

		return `${Columns[pos[1]]}${Rows[pos[0]]}`;
	}

	loadBoardHistory(moveIndex: number, halfMoveIndex: number) {
		this.selectPiece(undefined);
		this.viewingBoardHistory = true;

		this.loadFen(this.boardHistory[moveIndex * 2 + halfMoveIndex]);

		if (moveIndex * 2 + halfMoveIndex === this.boardHistory.length - 1) {
			this.viewingBoardHistory = false;
		}
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

	generateNotation(
		piece: Piece,
		fromPos: Position,
		toPos: Position,
		isCapture: boolean
	): string {
		if (piece.identifier === "K" && Math.abs(fromPos[1] - toPos[1]) === 2) {
			return fromPos[1] - toPos[1] === 2 ? "O-O-O" : "O-O";
		}

		let notation = "";

		if (this.isInCheck(piece.color === "w" ? "b" : "w")) {
			notation = "+";
		}

		if (this.checkmate) {
			notation = "#";
		}

		notation = this.positionToString(toPos) + notation;
		const fromNotation = this.positionToString(fromPos);

		if (isCapture) {
			notation = "x" + notation;

			if (piece.identifier === "P") {
				notation = fromNotation[0] + notation;
			}
		}

		// No need to go any further
		if (piece.identifier === "P") {
			return notation;
		}

		const attackers = this.getAttackingPieces(
			toPos,
			piece.color === "w" ? "b" : "w"
		);

		console.log(attackers);

		let sameRow = false;
		let sameCol = false;

		attackers.forEach((attacker) => {
			if (attacker.identifier !== piece.identifier) return;
			if (attacker.color !== piece.color) return;

			if (attacker.position[0] === fromPos[0]) sameRow = true;
			if (attacker.position[1] === fromPos[1]) sameCol = true;
		});

		if (sameCol) {
			notation = fromNotation[1] + notation;
		}

		if (sameRow) {
			notation = fromNotation[0] + notation;
		}

		if (piece.identifier !== "P") {
			notation = piece.identifier + notation;
		}

		return notation;
	}

	movePiece(fromPos: Position, toPos: Position) {
		if (this.gameOver || this.viewingBoardHistory) return;

		let piece: Piece | undefined = this.getSquare(fromPos);

		if (piece === undefined) {
			console.error(`From piece is not at ${fromPos}`);
			this.selectPiece(undefined);
			return;
		}

		this.selectPiece(undefined);

		if (!this.isClone && this.moveMakeCheck(fromPos, toPos)) {
			return;
		}
		const isCapture = this.getSquare(toPos) !== undefined;

		if (!piece.moveTo(toPos)) {
			return;
		}

		if (
			piece.identifier === "P" &&
			this.canPawnPromote(piece.position[0], piece.color)
		) {
			piece = new Queen(piece.position, piece.color, this);
			this.board[piece.position[0]][piece.position[1]] = piece;
		}

		this.currentMove = this.currentMove === "w" ? "b" : "w";

		if (this.currentMove === "w") {
			this.fullMoveClock += 1;
		}

		this.enPassentPossible = undefined;

		if (piece.identifier === "P" && Math.abs(fromPos[0] - toPos[0]) === 2) {
			this.enPassentPossible = [
				fromPos[0] - (fromPos[0] - toPos[0]) / 2,
				toPos[1],
			];
		}

		this.getValidSquares();

		if (!this.isClone) {
			this.finishMovePiece(piece, fromPos, toPos, isCapture);
		}

		this.generatefen();

		this.boardHistory.push(this.fen);

		this.updateState();
	}

	finishMovePiece(
		piece: Piece,
		fromPos: Position,
		toPos: Position,
		isCapture: boolean
	) {
		if (!isCapture && piece.identifier !== "P") {
			this.halfMoveClock += 1;
		} else {
			this.halfMoveClock = 0;
		}

		this.previousMove = [fromPos, toPos];

		this.checked = this.isInCheck(this.currentMove);

		this.checkmate = !this.hasValidMoves() && this.checked;
		console.log(this.checked);
		console.log(this.checkmate);

		if (!this.hasValidMoves() && !this.checked) {
			this.draw = true;
			this.drawReason = "stalemate";
		}

		if (this.halfMoveClock >= 100) {
			this.draw = true;
			this.drawReason = "50 move rule";
		}

		this.gameOver = this.checkmate || this.draw;

		const move = this.generateNotation(piece, fromPos, toPos, isCapture);
		if (this.currentMove === "w") {
			this.moves[this.moves.length - 1].push(move);
		} else {
			this.moves.push([move]);
		}
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

		try {
			gameClone.movePiece(fromPos, toPos);

			return gameClone.isInCheck(col);
		} catch (e) {
			// Move caused capture of king
			console.warn(e);
			return true;
		}
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
		return this.getAttackingPieces(position, color).length > 0;
	}

	getAttackingPieces(position: Position, color: "w" | "b"): Piece[] {
		if (!this.isPosInBounds(position)) return [];

		const attackers: Piece[] = [];

		this.board.forEach((row) => {
			row.forEach((square) => {
				if (!square) return;

				if (square.color === color) return;

				if (
					square.attackingSquares.some(
						(square) =>
							square[0] === position[0] &&
							square[1] === position[1]
					)
				) {
					attackers.push(square);
				}
			});
		});

		return attackers;
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
