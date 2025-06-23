import { Game } from "../Game/Game";
import { CardinalDirections, Piece, Position } from "./Piece";

export class Rook extends Piece {
	identifier: string = "R";
	value: number = 5;

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

		CardinalDirections.forEach(([x, y]) => {
			for (let i = 1; i <= 7; i += 1) {
				const pos: Position = [
					this.position[0] + x * i,
					this.position[1] + y * i,
				];

				if (!this.game.board.IsPosInBounds(pos)) {
					break;
				}

				const sq = this.game.board.GetSquare(pos);
				this.attackingSquares.push(pos);

				if (sq) {
					break;
				}
			}
		});
	}

	clone(g: Game): Piece {
		return new Rook(this.position, this.color, g);
	}
}
