import { Piece } from "../../pieces/Piece";
import { Game } from "../Game";
import { Position } from "../Position";

export function NotationToPosition(notation: string): Position {
	const col = notation.charCodeAt(0) - "a".charCodeAt(0);
	const row = 8 - parseInt(notation[1], 10);

	if (col < 0 || col > 7 || row < 0 || row > 7) {
		throw new Error("Invalid notation: " + notation);
	}

	return new Position(row, col);
}

export function GenerateNotation(
	piece: Piece,
	fromPos: Position,
	toPos: Position,
	isCapture: boolean,
	game: Game
): string {
	if (piece.identifier === "K" && Math.abs(fromPos.col - toPos.col) === 2) {
		return fromPos.col - toPos.col === 2 ? "O-O-O" : "O-O";
	}

	let notation = "";

	if (game.isInCheck(piece.color === "w" ? "b" : "w")) {
		notation = "+";
	}

	if (game.checkmate) {
		notation = "#";
	}

	notation = toPos.ToCoordinate() + notation;
	const fromNotation = fromPos.ToCoordinate();

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

	const attackers = game.GetPiecesSeeingSquare(
		toPos,
		piece.color === "w" ? "b" : "w"
	);

	let sameRow = false;
	let sameCol = false;

	attackers.forEach((attacker) => {
		if (piece === attacker) return;

		if (attacker.identifier !== piece.identifier) return;
		if (attacker.color !== piece.color) return;

		if (attacker.position.row === fromPos.row) sameRow = true;
		if (attacker.position.col === fromPos.col) sameCol = true;
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
