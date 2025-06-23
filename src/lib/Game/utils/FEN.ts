import { Board } from "../Board";

export function ParseFen(fen: string, board: Board) {
	const [
		piecePlacement,
		activeColor,
		castlingAvailability,
		enPassantTarget,
		halfMoveClock,
		fullMoveNumber,
	] = fen.split(" ");

	// Reset the board
	board.board = Array.from({ length: 8 }, () => Array(8).fill(undefined));

	let row = 0;
	let col = 0;

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

		board.CreatePiece(char, [row, col]);
		col++;
	}

	board.game.currentMove = activeColor === "w" ? "w" : "b";
	// board.game.castlingAvailability = castlingAvailability;
	// board.game.enPassantTarget = enPassantTarget === "-" ? null : enPassantTarget;
	board.game.halfMoveClock = parseInt(halfMoveClock, 10);
	board.game.fullMoveClock = parseInt(fullMoveNumber, 10);
}
