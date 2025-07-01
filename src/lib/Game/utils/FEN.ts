import { Board } from "../Board";
import { Position } from "../Position";
import { NotationToPosition } from "./Notation";

export function ParseFen(fen: string, board: Board) {
	const [
		piecePlacement,
		activeColor,
		castlingAvailability,
		enPassantTarget,
		halfMoveClock,
		fullMoveNumber,
	] = fen.split(" ");

	let row = 0;
	let col = 0;

	board.pieces = [];

	for (const char of piecePlacement) {
		if (char === "/") {
			row++;
			col = 0;
			continue;
		}

		if (/\d/.test(char)) {
			col += parseInt(char, 10);
			continue;
		}

		board.CreatePiece(char, new Position(row, col));
		col++;
	}

	board.game.currentMove = activeColor === "w" ? "w" : "b";
	const blackKing = board.GetKing("b");
	const whiteKing = board.GetKing("w");
	if (!blackKing || !whiteKing) {
		throw new Error("FEN must contain both kings");
	}
	blackKing.setCastleRights("k", castlingAvailability.includes("k"));
	blackKing.setCastleRights("q", castlingAvailability.includes("q"));
	whiteKing.setCastleRights("k", castlingAvailability.includes("K"));
	whiteKing.setCastleRights("q", castlingAvailability.includes("Q"));
	board.game.enPassentPossible =
		enPassantTarget === "-"
			? undefined
			: NotationToPosition(enPassantTarget);
	board.game.halfMoveClock = parseInt(halfMoveClock, 10);
	board.game.fullMoveClock = parseInt(fullMoveNumber, 10);

	board.UpdateValidSquares();
}
