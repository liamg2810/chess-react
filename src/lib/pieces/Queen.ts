import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class Queen extends Piece {
	identifier: string = "Q";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {}
}
