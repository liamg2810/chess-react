import { Game } from "../Game";
import { KingMovement, Piece, Position } from "./Piece";

export class King extends Piece {
	identifier: string = "K";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();

		this.validSquares = this.validSquares = [];

		this.attackingSquares.forEach((position) => {
			if (this.game.isSquareAttacked(position, this.color)) return;

			const sq = this.game.getSquare(position);

			if (sq) {
				if (sq.color !== this.color) {
					this.validSquares.push(position);
				}

				return;
			}

			this.validSquares.push(position);
		});
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		KingMovement.forEach(([x, y]) => {
			const pos: Position = [this.position[0] + x, this.position[1] + y];

			if (!this.game.isPosInBounds(pos)) {
				return;
			}

			const sq = this.game.getSquare(pos);

			if (sq) {
				this.attackingSquares.push(pos);

				return;
			}

			this.attackingSquares.push(pos);
		});
	}
}
