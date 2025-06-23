import { Game } from "../Game/Game";
import { KnightMovement, Piece, Position } from "./Piece";

export class Knight extends Piece {
	identifier: string = "N";
	value: number = 3;

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

		KnightMovement.forEach(([x, y]) => {
			const pos: Position = [this.position[0] + x, this.position[1] + y];

			if (!this.game.board.IsPosInBounds(pos)) {
				return;
			}

			const sq = this.game.board.GetSquare(pos);

			if (sq) {
				this.attackingSquares.push(pos);

				return;
			}

			this.attackingSquares.push(pos);
		});
	}

	clone(g: Game): Piece {
		return new Knight(this.position, this.color, g);
	}
}
