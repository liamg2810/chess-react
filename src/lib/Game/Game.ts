import { Piece, Position } from "../pieces/Piece";
import { GetMove } from "../Stockfish";
import { Board, StartFen } from "./Board";
import { ParseFen } from "./utils/FEN";
import { GenerateNotation } from "./utils/Notation";

export class Game {
	updateState: () => void;
	board: Board;
	highlitedSquares: Position[] = [];
	selectedPiece: Piece | undefined;
	currentMove: "b" | "w" = "w";
	checked: boolean = false;
	enPassentPossible: Position | undefined;
	halfMoveClock: number = 0;
	fullMoveClock: number = 1;
	eval: number = 0;
	mate: number | null = null;

	previousMove: Position[] = [];

	gameOver: boolean = false;
	checkmate: boolean = false;
	draw: boolean = false;
	drawReason: string = "stalemate";

	isClone: boolean = false;

	moves: string[][] = [];

	boardHistory: string[] = [];
	viewingBoardHistory: boolean = false;

	stockfishEnabled: boolean = true;
	stockfishDepth: number = 6;

	constructor(updateState: () => void, clone: boolean = false) {
		this.isClone = clone;
		this.board = new Board(this);

		if (!clone) {
			this.board.GenerateBoard();
		}

		this.updateState = updateState;
		this.Restart();
	}

	Restart(fen: string = StartFen) {
		this.moves = [];
		this.boardHistory = [];
		this.viewingBoardHistory = false;
		this.previousMove = [];
		this.eval = 0;
		this.mate = null;
		this.LoadFen(fen);
		this.updateState();
	}

	LoadFen(fen: string) {
		ParseFen(fen, this.board);
		this.board.UpdateValidSquares();
		this.updateState();
	}

	LoadBoardHistory(moveIndex: number, halfMoveIndex: number) {
		this.selectPiece(undefined);
		this.viewingBoardHistory = true;

		this.LoadFen(this.boardHistory[moveIndex * 2 + halfMoveIndex]);

		if (moveIndex * 2 + halfMoveIndex === this.boardHistory.length - 1) {
			this.viewingBoardHistory = false;
		}
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

		this.checkmate = this.checked && !this.hasValidMoves();
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

		const move = GenerateNotation(piece, fromPos, toPos, isCapture, this);
		if (this.currentMove === "w") {
			this.moves[this.moves.length - 1].push(move);
		} else {
			this.moves.push([move]);
		}
	}

	async runStockfish() {
		const ret = await GetMove(this.board.fen, this.stockfishDepth);

		this.eval = ret.eval;
		this.mate = ret.mate;

		this.updateState();

		if (this.currentMove !== "b" || !this.stockfishEnabled) {
			return;
		}

		console.log(ret);

		const fromPos: Position = [
			8 - parseInt(ret.fromNumeric[1]),
			parseInt(ret.fromNumeric[0]) - 1,
		];
		const toPos: Position = [
			8 - parseInt(ret.toNumeric[1]),
			parseInt(ret.toNumeric[0]) - 1,
		];

		this.board.MovePiece(fromPos, toPos);
	}

	canPawnPromote(yPos: number, color: "w" | "b"): boolean {
		return (color === "w" && yPos === 0) || (color === "b" && yPos === 7);
	}

	moveMakeCheck(
		fromPos: Position,
		toPos: Position,
		col: "w" | "b" = this.currentMove
	): boolean {
		const gameClone = new Game(() => {}, true);

		ParseFen(this.board.GenerateFen(), gameClone.board);
		gameClone.currentMove = col;
		gameClone.checked = this.checked;

		gameClone.board.GetSquare(fromPos)?.getValidSquares();

		try {
			if (!gameClone.board.MovePiece(fromPos, toPos)) {
				// return true; // Invalid move
			}

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

				const piece = this.board.GetSquare(pos);

				if (!piece || piece.color !== this.currentMove) {
					continue;
				}

				piece.getValidSquares();

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

	public selectSquare(position: Position) {
		if (this.stockfishEnabled && this.currentMove === "b") {
			return;
		}

		const piece: Piece | undefined = this.board.GetSquare(position);

		if (!piece) {
			if (this.selectedPiece) {
				this.board.MovePiece(this.selectedPiece.position, position);
			}

			return;
		}

		if (this.selectedPiece) {
			if (this.selectedPiece.color === piece.color) {
				this.selectPiece(piece);
			} else {
				this.board.MovePiece(
					this.selectedPiece.position,
					piece.position
				);
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
		if (!this.board.IsPosInBounds(position)) return [];

		const attackers: Piece[] = [];

		this.board.board.forEach((row) => {
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

	isInCheck(color: "w" | "b") {
		const king = this.board.GetKing(color);

		if (!king) {
			throw new Error(`No king found for color ${color}`);
		}

		return this.isSquareAttacked(king.position, color);
	}
}
