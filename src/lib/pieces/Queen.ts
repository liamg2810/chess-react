import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { CardinalDirections, DiagonalDirections, Piece } from "./Piece";
import { SlidingPiece } from "./SlidingPiece";

export class Queen extends SlidingPiece {
	identifier: string = "Q";
	value: number = 3;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(
			[...CardinalDirections, ...DiagonalDirections],
			position,
			color,
			game
		);
	}

	clone(g: Game): Piece {
		return new Queen(this.position, this.color, g);
	}
}
