import { Game } from "../Game/Game";
import { Position } from "../Game/Position";

export const CardinalDirections = [
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
];

export const DiagonalDirections = [
	[1, 1],
	[1, -1],
	[-1, -1],
	[-1, 1],
];

export const KnightMovement = [
	[2, 1],
	[2, -1],
	[-2, 1],
	[-2, -1],
	[1, 2],
	[1, -2],
	[-1, 2],
	[-1, -2],
];

export const KingMovement = [
	[1, -1],
	[1, 0],
	[1, 1],
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, 1],
	[0, -1],
];

export class Piece {
	position: Position;
	color: "w" | "b" = "b";
	lineToKing: Position[] = [];
	game: Game;
	identifier: string = "P";
	hasMoved: boolean = false;
	value: number = 1;
	// Reverse index for quick access to legal moves map
	legalMoves: string[] = [];

	constructor(
		position: Position,
		color: "w" | "b",
		game: Game,
		hasMoved: boolean = false
	) {
		this.position = position;
		this.color = color;
		this.game = game;
		this.hasMoved = hasMoved;
	}

	moveTo(position: Position): boolean {
		if (!this.isValidMove(position)) {
			return false;
		}

		this.hasMoved = true;

		const pieceAtDestination = this.game.board.GetPosition(position);

		if (pieceAtDestination) {
			if (pieceAtDestination.color !== this.color) {
				this.game.board.DeletePiece(pieceAtDestination);
			}
		}

		this.position.Set(position);

		return true;
	}

	isValidMove(position: Position): boolean {
		return (
			this.game.board.PosInLegalMoves(position, this) &&
			Position.IsValid(position.row, position.col)
		);
	}

	getPseudoLegalMoves() {
		throw Error(`Get Pseudo Legal Moves Is Not Implemented.`);
	}

	getValidSquares() {
		throw Error(`Get Valid Squares Is Not Implemented.`);
	}

	clone(g: Game): Piece {
		return new Piece(this.position, this.color, g, this.hasMoved);
	}
}
