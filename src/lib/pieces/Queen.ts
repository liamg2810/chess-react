import { Game } from "../Game";
import {
	CardinalDirections,
	DiagonalDirections,
	Piece,
	Position,
} from "./Piece";

export class Queen extends Piece {
	identifier: string = "Q";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();
		this.validSquares = [];

		this.attackingSquares.forEach((position) => {
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

		[...DiagonalDirections, ...CardinalDirections].forEach(([x, y]) => {
			let nextPos: Position = this.position;

			while (true) {
				const pos: Position = [nextPos[0] + x, nextPos[1] + y];
				nextPos = pos;

				if (!this.game.isPosInBounds(pos)) {
					break;
				}

				const sq = this.game.getSquare(pos);

				if (sq) {
					this.attackingSquares.push(pos);

					break;
				}

				this.attackingSquares.push(pos);
			}
		});
	}

	clone(g: Game): Piece {
		return new Queen(this.position, this.color, g);
	}
}
