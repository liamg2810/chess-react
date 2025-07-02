import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";
import { Game } from "./Game";
import { Move } from "./Move";
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

	AddPiece(piece: Piece): void {
		if (this.GetPosition(piece.position)) {
			console.error(
				`Cannot add piece at ${piece.position}, position already occupied`
			);
			return;
		}

		this.pieces.push(piece);
	}

	CreatePiece(char: string, position: Position): void {
		const piece = this.ParsePiece(char, position);

		if (!piece) {
			return;
		}

		piece.hasMoved = true; // Assume piece has moved unless it's a pawn on its starting row
		// Rooks are hacked in through ParseFEN so can ignore

		if (
			(piece.identifier === "P" &&
				piece.color === "w" &&
				position.row === 6) ||
			(piece.identifier === "P" &&
				piece.color === "b" &&
				position.row === 1)
		) {
			piece.hasMoved = false;
		}

		this.pieces.push(piece);
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
			console.error(`No legal moves found for position ${key}`);
			return false;
		}

		return moves.some(
			(p) =>
				p.color === piece.color &&
				p.identifier === piece.identifier &&
				p.position.Equals(piece.position)
		);
	}

	UpdatePseudoMoves(): void {
		this.pseudoBlack.clear();
		this.pseudoWhite.clear();

		for (const piece of this.pieces) {
			piece.getPseudoLegalMoves();
		}
	}

	// TODO: Cache valid squares by only updating the pieces affected by the last move, pieces that can see to and from
	UpdateValidSquares(): void {
		this.legalMoves.clear();

		this.UpdatePseudoMoves();

		for (const piece of this.pieces) {
			if (piece.color === this.game.currentMove) {
				piece.getValidSquares();
			}
		}
	}

	InitValidSquares(): void {
		this.UpdatePseudoMoves();

		for (const piece of this.pieces) {
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

	MovePiece(move: Move, perft: boolean = false): boolean {
		if (this.game.gameOver || this.game.viewingBoardHistory) {
			console.log("Trying to move when viewing history or game over");
			return false;
		}

		this.game.selectPiece(undefined);

		if (!move.MakeMove()) {
			console.error("Move failed to make");
			return false;
		}

		this.game.currentMove = this.game.currentMove === "w" ? "b" : "w";

		this.UpdateValidSquares();

		if (!perft) {
			if (this.game.currentMove === "w") {
				this.game.fullMoveClock += 1;
			}

			this.fen = this.GenerateFen();

			this.game.finishMovePiece(move);

			this.game.updateState();

			this.game.runStockfish();
		}

		return true;
	}
}
