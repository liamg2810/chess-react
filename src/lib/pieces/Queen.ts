import { Game } from "../Game/Game";
import {
	CardinalDirections,
	DiagonalDirections,
	Piece,
	Position,
} from "./Piece";

export class Queen extends Piece {
	identifier: string = "Q";
	value: number = 9;

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
			const sq = this.game.board.GetSquare(position);

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
			for (let i = 1; i <= 7; i += 1) {
				const pos: Position = [
					this.position[0] + x * i,
					this.position[1] + y * i,
				];

				if (!this.game.board.IsPosInBounds(pos)) {
					break;
				}

				const sq = this.game.board.GetSquare(pos);

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
