import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";
import { Game } from "./Game";
import { Position } from "./Position";
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

export class Board {
	game: Game;
	fen: string = StartFen;
	pieces: Piece[] = [];
	pseudoBlack: Map<string, Piece[]> = new Map();
	pseudoWhite: Map<string, Piece[]> = new Map();
	// E.G "e4" -> [Pawn, Knight]
	legalMoves: Map<string, Piece[]> = new Map();

	constructor(game: Game) {
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
			this.pieces.push(piece);
		}
	}

	AddPseudoMove(pos: Position, color: "w" | "b", piece: Piece) {
		const key = pos.ToCoordinate();

		if (color === "w") {
			if (!this.pseudoWhite.has(key)) {
				this.pseudoWhite.set(key, []);
			}

			this.pseudoWhite.get(key)?.push(piece);
		} else {
			if (!this.pseudoBlack.has(key)) {
				this.pseudoBlack.set(key, []);
			}

			this.pseudoBlack.get(key)?.push(piece);
		}
	}

	AddLegalMove(pos: Position, piece: Piece): void {
		const key = pos.ToCoordinate();

		if (!this.legalMoves.has(key)) {
			this.legalMoves.set(key, []);
		}

		this.legalMoves.get(key)?.push(piece);
	}

	PosInLegalMoves(pos: Position, piece: Piece): boolean {
		const key = pos.ToCoordinate();

		const moves = this.legalMoves.get(key);

		if (!moves) {
			return false;
		}

		return moves.some((m) => m === piece);
	}

	UpdatePseudoMoves(): void {
		this.pseudoBlack.clear();
		this.pseudoWhite.clear();

		for (const piece of this.pieces) {
			const pseudoMoves = piece.getPseudoLegalMoves();

			for (const pos of pseudoMoves) {
				this.AddPseudoMove(pos, piece.color, piece);
			}
		}
	}

	UpdateValidSquares(): void {
		this.UpdatePseudoMoves();

		this.legalMoves.clear();

		for (const piece of this.pieces) {
			if (piece.color !== this.game.currentMove) {
				continue;
			}

			piece.getValidSquares();
		}
	}

	GetPiece(identifier: string): Piece | undefined {
		for (const piece of this.pieces) {
			if (
				piece.identifier.toLowerCase() === identifier.toLowerCase() &&
				piece.color ===
					(identifier === identifier.toUpperCase() ? "w" : "b")
			) {
				return piece;
			}
		}
	}

	GetKing(color: "w" | "b"): King | undefined {
		return this.GetPiece(color === "w" ? "K" : "k") as King | undefined;
	}

	GetPosition(pos: Position): Piece | undefined {
		if (!Position.IsValid(pos.row, pos.col)) {
			console.error(`Position out of bounds: ${pos.row}, ${pos.col}`);
			return undefined;
		}

		return this.pieces.find((piece) => piece.position.Equals(pos));
	}

	GenerateFen(): string {
		let fen = "";
		for (let row = 0; row < 8; row++) {
			let emptyCount = 0;
			for (let col = 0; col < 8; col++) {
				const piece = this.GetPosition(new Position(row, col));

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

	DeletePiece(piece: Piece): void {
		const index = this.pieces.indexOf(piece);

		if (index !== -1) {
			this.pieces.splice(index, 1);
		} else {
			console.error("Piece not found in pieces array");
		}
	}

	MovePiece(fromPos: Position, toPos: Position): boolean {
		if (this.game.gameOver || this.game.viewingBoardHistory) {
			console.log("Trying to move when viewing history or game over");
			return false;
		}

		let piece: Piece | undefined = this.GetPosition(fromPos);

		if (piece === undefined) {
			console.error(`From piece is not at ${fromPos}`);
			this.game.selectPiece(undefined);
			return false;
		}

		this.game.selectPiece(undefined);

		if (this.game.moveMakeCheck(fromPos, toPos)) {
			console.error(
				`Move from ${fromPos} to ${toPos} would put the king in check`
			);
			return false;
		}
		const isCapture = this.GetPosition(toPos) !== undefined;

		if (!piece.moveTo(toPos)) {
			return false;
		}

		if (
			piece.identifier === "P" &&
			this.game.canPawnPromote(piece.position.row, piece.color)
		) {
			const index = this.pieces.indexOf(piece);

			if (index !== -1) {
				const promoted = new Queen(
					piece.position,
					piece.color,
					this.game
				);
				this.pieces[index] = promoted;
				piece = promoted;
			} else {
				console.error("Piece not found in pieces array");
				return false;
			}
		}

		this.game.enPassentPossible = undefined;

		if (
			piece.identifier === "P" &&
			Math.abs(fromPos.row - toPos.row) === 2
		) {
			this.game.enPassentPossible = new Position(
				(fromPos.row + toPos.row) / 2,
				toPos.col
			);
		}

		this.game.currentMove = this.game.currentMove === "w" ? "b" : "w";

		if (this.game.currentMove === "w") {
			this.game.fullMoveClock += 1;
		}

		this.game.finishMovePiece(piece, fromPos, toPos, isCapture);

		this.fen = this.GenerateFen();

		this.UpdateValidSquares();

		this.game.boardHistory.push(this.fen);

		this.game.updateState();

		this.game.runStockfish();

		return true;
	}
}
