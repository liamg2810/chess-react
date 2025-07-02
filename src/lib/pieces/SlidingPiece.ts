import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { NotationToPosition } from "../Game/utils/Notation";
import { Piece } from "./Piece";

export class SlidingPiece extends Piece {
	direction: number[][] = [];

	constructor(
		direction: number[][],
		position: Position,
		color: "w" | "b",
		game: Game
	) {
		super(position, color, game);

		this.direction = direction;
	}

	getValidSquares(): void {
		for (const [square, pieces] of this.color === "w"
			? this.game.board.pseudoWhite
			: this.game.board.pseudoBlack) {
			if (!pieces.includes(this)) {
				continue;
			}

			const position = NotationToPosition(square);
			if (this.game.moveMakeCheck(this.position, position, this.color)) {
				continue;
			}

			this.game.board.AddLegalMove(position, this);
		}
	}

	getPseudoLegalMoves() {
		this.lineToKing = [];

		this.direction.forEach(([x, y]) => {
			const tempLine: Position[] = [];

			let foundKing = false;
			let canAddPseudo = true;

			for (let i = 1; i <= 7; i += 1) {
				const row = this.position.row + x * i;
				const col = this.position.col + y * i;

				if (!Position.IsValid(row, col)) {
					break;
				}

				const position = new Position(
					this.position.row + x * i,
					this.position.col + y * i
				);

				const sq = this.game.board.GetPosition(position);

				if (canAddPseudo) {
					if (!sq) {
						this.game.board.AddPseudoMove(
							position,
							this.color,
							this
						);
					} else {
						if (sq.color !== this.color) {
							this.game.board.AddPseudoMove(
								position,
								this.color,
								this
							);
						}
						canAddPseudo = false;
					}
				}

				if (sq) {
					tempLine.push(position);

					if (sq.identifier === "K" && sq.color !== this.color) {
						foundKing = true;
						break;
					}
				}
			}

			if (foundKing) {
				this.lineToKing = tempLine;
			}
		});
	}
}
