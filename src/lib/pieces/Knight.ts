import { Game } from "../Game";
import { KnightMovement, Piece, Position } from "./Piece";

export class Knight extends Piece {
	identifier: string = "Kn";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();

		this.validSquares = [];

		this.attackingSquares.forEach((position) => {
			this.validSquares.push(position);
		});
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		KnightMovement.forEach(([x, y]) => {
			const pos: Position = [this.position[0] + x, this.position[1] + y];

			if (!this.game.isPosInBounds(pos)) {
				return;
			}

			const sq = this.game.getSquare(pos);

			if (sq) {
				if (sq.color !== this.color) {
					this.attackingSquares.push(pos);
				}

				return;
			}

			this.attackingSquares.push(pos);
		});
	}
}
