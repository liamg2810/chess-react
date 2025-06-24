import { Piece, Position } from "../../pieces/Piece";
import { Game } from "../Game";

export function NotationToPosition(notation: string): Position {
	const col = notation.charCodeAt(0) - "a".charCodeAt(0);
	const row = 8 - parseInt(notation[1], 10);

	if (col < 0 || col > 7 || row < 0 || row > 7) {
		throw new Error("Invalid notation: " + notation);
	}

	return [row, col];
}

export function GenerateNotation(
	piece: Piece,
	fromPos: Position,
	toPos: Position,
	isCapture: boolean,
	game: Game
): string {
	if (piece.identifier === "K" && Math.abs(fromPos[1] - toPos[1]) === 2) {
		return fromPos[1] - toPos[1] === 2 ? "O-O-O" : "O-O";
	}

	let notation = "";

	if (game.isInCheck(piece.color === "w" ? "b" : "w")) {
		notation = "+";
	}

	if (game.checkmate) {
		notation = "#";
	}

	notation = game.board.PositionToString(toPos) + notation;
	const fromNotation = game.board.PositionToString(fromPos);

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

	const attackers = game.getAttackingPieces(
		toPos,
		piece.color === "w" ? "b" : "w"
	);

	let sameRow = false;
	let sameCol = false;

	attackers.forEach((attacker) => {
		if (attacker.identifier !== piece.identifier) return;
		if (attacker.color !== piece.color) return;

		if (attacker.position[0] === fromPos[0]) sameRow = true;
		if (attacker.position[1] === fromPos[1]) sameCol = true;
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
