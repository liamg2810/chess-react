import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { CardinalDirections, Piece } from "./Piece";
import { SlidingPiece } from "./SlidingPiece";

export class Rook extends SlidingPiece {
	identifier: string = "R";
	value: number = 3;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(CardinalDirections, position, color, game);
	}

	clone(g: Game): Piece {
		return new Rook(this.position, this.color, g);
	}
}
