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

		this.validSquares = this.attackingSquares;
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		[...DiagonalDirections, ...CardinalDirections].forEach(([x, y]) => {
			let nextPos: Position = this.position;

			while (true) {
				const pos: Position = [nextPos[0] + x, nextPos[1] + y];
				nextPos = pos;

				if (!this.game.isPosInBounds(pos)) {
					return;
				}

				const sq = this.game.getSquare(pos);

				if (sq) {
					if (sq.color !== this.color) {
						this.validSquares.push(pos);
					}

					return;
				}

				this.attackingSquares.push(pos);
			}
		});
	}
}
