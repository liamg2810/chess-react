import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
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
		const pseudoMoves = this.getPseudoLegalMoves();

		for (const position of pseudoMoves) {
			if (this.game.moveMakeCheck(this.position, position, this.color)) {
				continue;
			}

			this.game.board.AddLegalMove(position, this);
		}
	}

	getPseudoLegalMoves(): Position[] {
		const pseudoMoves: Position[] = [];

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
						pseudoMoves.push(position);
					} else {
						if (sq.color !== this.color) {
							pseudoMoves.push(position);
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

		return pseudoMoves;
	}
}
