import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class King extends Piece {
	identifier: string = "K";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {}
}
