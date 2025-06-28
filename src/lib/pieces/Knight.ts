import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { KnightMovement, Piece } from "./Piece";

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
			const sq = this.game.board.GetPosition(position);

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

		for (const [dx, dy] of KnightMovement) {
			let pos: Position;

			try {
				pos = new Position(
					this.position.row + dx,
					this.position.col + dy
				);
			} catch {
				// If the position is out of bounds, skip it
				return;
			}

			this.attackingSquares.push(pos);
		}
	}

	clone(g: Game): Piece {
		return new Knight(this.position, this.color, g);
	}
}
