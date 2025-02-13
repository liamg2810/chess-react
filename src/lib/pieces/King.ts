import { Game } from "../Game";
import { KingMovement, Piece, Position } from "./Piece";

export class King extends Piece {
	identifier: string = "K";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		KingMovement.forEach(([x, y]) => {
			const pos: Position = [this.position[0] + x, this.position[1] + y];

			if (!this.game.isPosInBounds(pos)) {
				return;
			}

			const sq = this.game.getSquare(pos);

			if (sq !== undefined) {
				if (sq.color === this.color) {
					return;
				}
			}

			this.attackingSquares.push(pos);
		});
	}
}
