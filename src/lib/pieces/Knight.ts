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

		KnightMovement.forEach(([x, y]) => {
			const row = this.position.row + x;
			const col = this.position.col + y;

			if (!Position.IsValid(row, col)) {
				return;
			}

			const position = new Position(row, col);

			const sq = this.game.board.GetPosition(position);

			if (sq) {
				if (sq.color !== this.color) {
					pseudoMoves.push(position);
				}

				return;
			}

			pseudoMoves.push(position);
		});
		return pseudoMoves;
	}

	clone(g: Game): Piece {
		return new Knight(this.position, this.color, g);
	}
}
