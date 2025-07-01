import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { NotationToPosition } from "../Game/utils/Notation";
import { KnightMovement, Piece } from "./Piece";

export class Knight extends Piece {
	identifier: string = "N";
	value: number = 3;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.legalMoves = [];

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

			this.legalMoves.push(square);

			this.game.board.AddLegalMove(position, this);
		}
	}

	getPseudoLegalMoves() {
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
					this.game.board.AddPseudoMove(position, this.color, this);
				}

				return;
			}

			this.game.board.AddPseudoMove(position, this.color, this);
		});
	}

	clone(g: Game): Piece {
		return new Knight(this.position, this.color, g);
	}
}
