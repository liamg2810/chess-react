import { Game } from "../Game";
import { DiagonalDirections, Piece, Position } from "./Piece";

export class Bishop extends Piece {
	identifier: string = "B";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();
		this.validSquares = [];

		this.attackingSquares.forEach((position) => {
			if (!this.game.isClone) {
				if (
					this.game.moveMakeCheck(this.position, position, this.color)
				) {
					return;
				}
			}
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

		DiagonalDirections.forEach(([x, y]) => {
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
		return new Bishop(this.position, this.color, g);
	}
}
