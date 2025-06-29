import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { DiagonalDirections, Piece } from "./Piece";
import { SlidingPiece } from "./SlidingPiece";

export class Bishop extends SlidingPiece {
	identifier: string = "B";
	value: number = 3;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(DiagonalDirections, position, color, game);
	}

	clone(g: Game): Piece {
		return new Bishop(this.position, this.color, g);
	}
}
