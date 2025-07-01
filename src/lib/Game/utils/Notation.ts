import { Position } from "../Position";

export function NotationToPosition(notation: string): Position {
	const col = notation.charCodeAt(0) - "a".charCodeAt(0);
	const row = 8 - parseInt(notation[1], 10);

	if (col < 0 || col > 7 || row < 0 || row > 7) {
		throw new Error("Invalid notation: " + notation);
	}

	return new Position(row, col);
}
