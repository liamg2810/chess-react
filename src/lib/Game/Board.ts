import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece, Position } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";
import { Game } from "./Game";
import { ParseFen } from "./utils/FEN";

export const StartFen: string =
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const Pieces: { [key: string]: typeof Piece } = {
	R: Rook,
	N: Knight,
	B: Bishop,
	Q: Queen,
	K: King,
	P: Pawn,
};

export const Columns: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const Rows: string[] = ["8", "7", "6", "5", "4", "3", "2", "1"];

export class Board {
	board: (Piece | undefined)[][];
	game: Game;
	fen: string = StartFen;

	constructor(game: Game) {
		this.board = Array.from({ length: 8 }, () => Array(8).fill(undefined));
		this.game = game;
	}

	GenerateBoard(): void {
		ParseFen(StartFen, this);
		this.UpdateValidSquares();
	}

	ParsePiece(char: string, position: Position): Piece | undefined {
		const color = char === char.toUpperCase() ? "w" : "b";
		const pieceType = char.toLowerCase();

		const PieceClass = Pieces[pieceType.toUpperCase()];

		if (!PieceClass) {
			console.error(`Unknown piece type: ${char}`);
			return undefined;
		}

		return new PieceClass(position, color, this.game);
	}

	CreatePiece(char: string, position: Position): void {
		const piece = this.ParsePiece(char, position);

		if (piece) {
			this.board[position[0]][position[1]] = piece;
			piece.position = position;
		}
	}

	UpdateValidSquares(): void {
		for (const row of this.board) {
			for (const piece of row) {
				if (piece) {
					piece.getValidSquares();
				}
			}
		}
	}

	GetPiece(identifier: string): Piece | undefined {
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const piece = this.board[row][col];
				if (
					piece &&
					piece.identifier.toLowerCase() ===
						identifier.toLowerCase() &&
					piece.color ===
						(identifier === identifier.toUpperCase() ? "w" : "b")
				) {
					return piece;
				}
			}
		}
		return undefined;
	}

	GetKing(color: "w" | "b"): King | undefined {
		return this.GetPiece(color === "w" ? "K" : "k") as King | undefined;
	}

	GenerateFen(): string {
		let fen = "";
		for (let row = 0; row < 8; row++) {
			let emptyCount = 0;
			for (let col = 0; col < 8; col++) {
				const piece = this.board[row][col];
				if (piece) {
					if (emptyCount > 0) {
						fen += emptyCount;
						emptyCount = 0;
					}
					fen +=
						piece.color === "w"
							? piece.identifier
							: piece.identifier.toLowerCase();
				} else {
					emptyCount++;
				}
			}
			if (emptyCount > 0) {
				fen += emptyCount;
			}
			if (row < 7) {
				fen += "/";
			}
		}

		const [whiteQueenCastle, whiteKingCastle] = this.GetKing(
			"w"
		)?.castleRights() || [false, false];
		const [blackQueenCastle, blackKingCastle] = this.GetKing(
			"b"
		)?.castleRights() || [false, false];

		const castlingRights =
			[
				whiteKingCastle ? "K" : "",
				whiteQueenCastle ? "Q" : "",
				blackKingCastle ? "k" : "",
				blackQueenCastle ? "q" : "",
			].join("") || "-";

		fen += ` ${this.game.currentMove} ${castlingRights} - ${this.game.halfMoveClock} ${this.game.fullMoveClock}`;
		this.fen = fen;
		return fen;
	}

	PositionToString(pos: Position | undefined): string {
		if (!pos) return "";

		return `${Columns[pos[1]]}${Rows[pos[0]]}`;
	}

	IsPosInBounds(position: Position): boolean {
		return (
			position[0] < this.board.length &&
			position[0] >= 0 &&
			position[1] >= 0 &&
			position[1] < this.board[position[0]].length
		);
	}

	GetSquare(position: Position): Piece | undefined {
		if (!this.IsPosInBounds(position)) {
			return;
		}
		return this.board[position[0]][position[1]];
	}

	MovePiece(fromPos: Position, toPos: Position): boolean {
		if (this.game.gameOver || this.game.viewingBoardHistory) {
			console.log("Trying to move when viewing history or game over");
			return false;
		}

		let piece: Piece | undefined = this.GetSquare(fromPos);

		if (piece === undefined) {
			console.error(`From piece is not at ${fromPos}`);
			this.game.selectPiece(undefined);
			return false;
		}

		this.game.selectPiece(undefined);

		if (!this.game.isClone && this.game.moveMakeCheck(fromPos, toPos)) {
			console.log("Clone or move will make check");
			return false;
		}
		const isCapture = this.GetSquare(toPos) !== undefined;

		if (!piece.moveTo(toPos)) {
			if (!this.game.isClone) {
				console.log(piece, toPos);
				console.log("Piece failed to move");
			}
			return false;
		}

		if (
			piece.identifier === "P" &&
			this.game.canPawnPromote(piece.position[0], piece.color)
		) {
			piece = new Queen(piece.position, piece.color, this.game);
			this.board[piece.position[0]][piece.position[1]] = piece;
		}

		this.game.enPassentPossible = undefined;

		if (piece.identifier === "P" && Math.abs(fromPos[0] - toPos[0]) === 2) {
			const attackers = this.game.getAttackingPieces(
				[(fromPos[0] + toPos[0]) / 2, fromPos[1]],
				this.game.currentMove
			);

			// Only allow en passent if pawn is attacking
			if (attackers.some((a) => a.identifier === "P")) {
				this.game.enPassentPossible = [
					(fromPos[0] + toPos[0]) / 2,
					toPos[1],
				];
			}
		}

		this.game.currentMove = this.game.currentMove === "w" ? "b" : "w";

		if (this.game.currentMove === "w") {
			this.game.fullMoveClock += 1;
		}

		if (!this.game.isClone) {
			this.game.finishMovePiece(piece, fromPos, toPos, isCapture);
		}

		this.GenerateFen();

		this.UpdateValidSquares();

		this.game.boardHistory.push(this.fen);

		this.game.updateState();

		if (!this.game.isClone) {
			console.log("running stockfish");
			this.game.runStockfish();
		}

		return true;
	}
}
