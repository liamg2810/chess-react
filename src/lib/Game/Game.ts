import { Piece } from "../pieces/Piece";
import { GetMove } from "../Stockfish";
import { Board, StartFen } from "./Board";
import { Move } from "./Move";
import { Position } from "./Position";
import { ParseFen } from "./utils/FEN";
import { NotationToPosition } from "./utils/Notation";

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

	previousMove: Move | undefined = undefined;

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
		this.previousMove = undefined;
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
		this.board.InitValidSquares();
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

	finishMovePiece(move: Move) {
		if (!move.capture && move.piece.identifier !== "P") {
			this.halfMoveClock += 1;
		} else {
			this.halfMoveClock = 0;
		}

		this.boardHistory.push(this.board.fen);

		this.previousMove = move;

		this.checked = this.isInCheck(this.currentMove);

		const validMoves = this.hasValidMoves();

		this.checkmate = this.checked && !validMoves;

		if (!validMoves && !this.checked) {
			this.draw = true;
			this.drawReason = "stalemate";
		}

		if (this.halfMoveClock >= 100) {
			this.draw = true;
			this.drawReason = "50 move rule";
		}

		this.gameOver = this.checkmate || this.draw;

		// Current move has already changed after the move so actually w is black just moved
		if (this.currentMove === "w") {
			this.moves[this.moves.length - 1].push(move.notation);
		} else {
			this.moves.push([move.notation]);
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

		const moveAlpha = ret.bestmove;
		const fromAlpha = moveAlpha.slice(0, 2);
		const toAlpha = moveAlpha.slice(2, 4);

		// TODO: Clean this up
		const move = new Move(
			NotationToPosition(fromAlpha),
			NotationToPosition(toAlpha),
			this.board.GetPosition(NotationToPosition(fromAlpha))!,
			this.board
		);

		this.board.MovePiece(move);
	}

	canPawnPromote(yPos: number, color: "w" | "b"): boolean {
		return (color === "w" && yPos === 0) || (color === "b" && yPos === 7);
	}

	moveBreakCheck(
		toPos: Position,
		lineToKing: Position[],
		checkingPiece: Piece
	): boolean {
		if (lineToKing.length !== 1) {
			// Should never have this case but just in case
			return true;
		}

		const king = lineToKing[0];

		const dX = Math.sign(king.row - checkingPiece.position.row);
		const dY = Math.sign(king.col - checkingPiece.position.col);

		// Generate all squares between the checking piece and the king (exclusive)
		const squaresBetween: Position[] = [];
		let currRow = checkingPiece.position.row + dX;
		let currCol = checkingPiece.position.col + dY;

		while (currRow !== king.row || currCol !== king.col) {
			squaresBetween.push(new Position(currRow, currCol));
			if (currRow === king.row && currCol === king.col) break;
			currRow += dX;
			currCol += dY;
		}

		// Check if toPos is in the line between checking piece and king
		return squaresBetween.some((pos) => pos.Equals(toPos));
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

			if (piece.lineToKing.length === 0 || piece.lineToKing.length > 2) {
				// Piece cannot concievably pin the king and is not attacking the king
				continue;
			}

			if (piece.lineToKing.length === 1) {
				// King is in check compute if the move breaks the check
				return !this.moveBreakCheck(toPos, piece.lineToKing, piece);
			}

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
		return this.board.legalMoves.size > 0;
	}

	selectPiece(piece: Piece | undefined) {
		this.selectedPiece = piece;
		this.highlitedSquares = [];

		if (piece) {
			this.board.legalMoves.forEach((value, key) => {
				if (value.some((p) => p === piece)) {
					this.highlitedSquares.push(NotationToPosition(key));
				}
			});
		}

		this.updateState();
	}

	public selectSquare(position: Position) {
		if (this.stockfishEnabled && this.currentMove === "b") {
			return;
		}

		const piece: Piece | undefined = this.board.GetPosition(position);

		if (!piece) {
			if (this.selectedPiece) {
				const fromPos = this.selectedPiece.position;
				const toPos = position;
				const move = new Move(
					fromPos,
					toPos,
					this.selectedPiece,
					this.board
				);

				this.board.MovePiece(move);
			}

			return;
		}

		if (this.selectedPiece) {
			if (this.selectedPiece.color === piece.color) {
				this.selectPiece(piece);
			} else {
				const fromPos = this.selectedPiece.position;
				const toPos = piece.position;
				const move = new Move(
					fromPos,
					toPos,
					this.selectedPiece,
					this.board
				);

				this.board.MovePiece(move);
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
		if (!Position.IsValid(position.row, position.col)) return [];

		if (color === "w") {
			const pseudoBlack =
				this.board.pseudoBlack.get(position.ToCoordinate()) || [];

			return pseudoBlack;
		} else {
			const pseudoWhite =
				this.board.pseudoWhite.get(position.ToCoordinate()) || [];

			return pseudoWhite;
		}
	}

	isInCheck(color: "w" | "b") {
		const king = this.board.GetKing(color);

		if (!king) {
			throw new Error(`No king found for color ${color}`);
		}

		return this.isSquareAttacked(king.position, color);
	}

	undoLastMove() {
		if (!this.previousMove) {
			return;
		}

		this.previousMove.UnMakeMove();
	}
}
