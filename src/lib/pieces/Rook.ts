import { Game } from "../Game";
import { CardinalDirections, Piece, Position } from "./Piece";

export class Rook extends Piece {
	identifier: string = "R";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		CardinalDirections.forEach(([x, y]) => {
			let stopNext = false;
			let nextPos: Position = this.position;

			while (!stopNext) {
				const pos: Position = [nextPos[0] + x, nextPos[1] + y];
				console.log(x, y, pos, nextPos);
				nextPos = pos;

				if (!this.game.isPosInBounds(pos)) {
					console.log("not in bounds", pos);
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
