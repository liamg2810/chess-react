import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class Bishop extends Piece {
	identifier: string = "B";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {}
}
