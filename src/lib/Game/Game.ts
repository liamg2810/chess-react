import { Piece } from "../pieces/Piece";
import { GetMove } from "../Stockfish";
import { Board, StartFen } from "./Board";
import { Position } from "./Position";
import { ParseFen } from "./utils/FEN";
import { GenerateNotation, NotationToPosition } from "./utils/Notation";

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
	eval: string | number = 0;
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

	stockfishEnabled: boolean = false;
	crippleStockfish: boolean = true;
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
		this.checked = false;
		this.gameOver = false;
		this.checkmate = false;
		this.draw = false;
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
		if (this.crippleStockfish) {
			return;
		}

		const ret = await GetMove(
			this.board.GenerateFen(),
			this.stockfishDepth
		);

		if (!ret || !ret.bestmove) {
			console.warn("Stockfish did not return a move");
			return;
		}

		this.eval = ret.eval;

		this.updateState();

		if (this.currentMove === "w" || !this.stockfishEnabled) {
			return;
		}

		const move = ret.bestmove;
		const fromAplha = move.slice(0, 2);
		const toAlpha = move.slice(2, 4);

		const fromPos = NotationToPosition(fromAplha);
		const toPos = NotationToPosition(toAlpha);

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
		const king = this.board.GetKing(col);

		if (!king) {
			throw new Error(`No king found for color ${col}`);
		}

		const fromPiece = this.board.GetPosition(fromPos);

		if (!fromPiece) {
			throw new Error(`No piece found at position ${fromPos}`);
		}

		// Edge case of moving the king
		if (fromPiece.identifier === "K") {
			return this.isSquareAttacked(toPos, col);
		}

		// Loop through all pieces of the opposite color to check for pins
		for (const piece of this.board.pieces) {
			if (piece.color === col) {
				continue;
			}

			// Piece cannot be pinned
			if (piece.lineToKing.length <= 1) {
				continue;
			}

			console.log(
				`Checking piece ${
					piece.identifier
				} at ${piece.position.ToCoordinate()}`
			);

			console.log(
				`Line to king: ${piece.lineToKing.map((p) => p.ToCoordinate())}`
			);

			console.log(`From position: ${fromPos.ToCoordinate()}`);
			console.log(`King position: ${king.position.ToCoordinate()}`);

			if (
				piece.lineToKing[0].Equals(fromPos) &&
				piece.lineToKing[1].Equals(king.position)
			) {
				// If the piece is attacking the king and the from position, it is pinned
				return true;
			}
		}

		return false;
	}

	hasValidMoves(): boolean {
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const pos: Position = new Position(row, col);

				const piece = this.board.GetPosition(pos);

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

		const piece: Piece | undefined = this.board.GetPosition(position);

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
		return this.GetPiecesSeeingSquare(position, color).length > 0;
	}

	GetPiecesSeeingSquare(position: Position, color: "w" | "b"): Piece[] {
		if (!position.IsInBounds()) return [];

		const attackers: Piece[] = [];

		this.board.pieces.forEach((piece) => {
			if (piece.color === color) return;

			if (piece.validSquares.some((pos) => pos.Equals(position))) {
				attackers.push(piece);
			}
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
