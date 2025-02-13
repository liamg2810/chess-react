import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class Knight extends Piece {
	identifier: string = "Kn";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {}
}
