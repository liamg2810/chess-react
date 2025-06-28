import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { DiagonalDirections, Piece } from "./Piece";

export class Bishop extends Piece {
	identifier: string = "B";
	value: number = 3;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();
		this.validSquares = [];

		DiagonalDirections.forEach(([x, y]) => {
			for (let i = 1; i <= 7; i += 1) {
				let position: Position;

				try {
					position = new Position(
						this.position.row + x * i,
						this.position.col + y * i
					);
				} catch {
					// If the position is out of bounds, skip it
					return;
				}

				if (!this.game.isClone) {
					if (
						this.game.moveMakeCheck(
							this.position,
							position,
							this.color
						)
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
			}
		});
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];
		this.lineToKing = [];

		DiagonalDirections.forEach(([x, y]) => {
			for (let i = 1; i <= 7; i += 1) {
				let pos: Position;

				try {
					pos = new Position(
						this.position.row + x * i,
						this.position.col + y * i
					);
				} catch {
					// If the position is out of bounds, skip it
					return;
				}

				const sq = this.game.board.GetPosition(pos);

				if (sq && sq.color !== this.color && sq.identifier === "K") {
					for (let j = 1; j <= i; j += 1) {
						const position = new Position(
							this.position.row + x * j,
							this.position.col + y * j
						);

						const sq = this.game.board.GetPosition(position);

						// Only add pieces to the line to the king
						if (sq) {
							this.lineToKing.push(
								new Position(
									this.position.row + x * j,
									this.position.col + y * j
								)
							);
						}
					}
				}

				this.attackingSquares.push(pos);
			}
		});
	}

	clone(g: Game): Piece {
		return new Bishop(this.position, this.color, g);
	}
}
