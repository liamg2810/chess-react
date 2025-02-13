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

	getAttackingSquares(): void {
		this.attackingSquares = [];

		[...DiagonalDirections, ...CardinalDirections].forEach(([x, y]) => {
			let stopNext = false;
			let nextPos: Position = this.position;

			while (!stopNext) {
				const pos: Position = [nextPos[0] + x, nextPos[1] + y];
				nextPos = pos;

				if (!this.game.isPosInBounds(pos)) {
					break;
				}

				const sq = this.game.getSquare(pos);

				if (sq !== undefined) {
					if (sq.color === this.color) {
						break;
					}

					stopNext = true;
				}

				this.attackingSquares.push(pos);
			}
		});
	}
}
