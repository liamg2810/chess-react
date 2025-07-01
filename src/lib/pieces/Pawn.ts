import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { NotationToPosition } from "../Game/utils/Notation";
import { Piece } from "./Piece";

export class Pawn extends Piece {
	identifier: string = "P";

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
		let attackDirection = 1;

		if (this.color === "w") {
			attackDirection = -1;
		}

		const row = this.position.row + attackDirection;
		const leftCol = this.position.col - 1;
		const rightCol = this.position.col + 1;

		if (Position.IsValid(row, leftCol)) {
			const leftPos = new Position(row, leftCol);
			const sq = this.game.board.GetPosition(leftPos);

			if (sq && sq.color !== this.color) {
				this.game.board.AddPseudoMove(leftPos, this.color, this);
			}
		}

		if (Position.IsValid(row, rightCol)) {
			const rightPos = new Position(row, rightCol);

			const sq = this.game.board.GetPosition(rightPos);

			if (sq && sq.color !== this.color) {
				this.game.board.AddPseudoMove(rightPos, this.color, this);
			}
		}

		let attackPotential = 1;

		if (!this.hasMoved) {
			attackPotential *= 2;
		}

		for (let a = 1; a <= attackPotential; a += 1) {
			const row = this.position.row + attackDirection * a;

			if (!Position.IsValid(row, this.position.col)) {
				continue;
			}

			const pos = new Position(row, this.position.col);

			if (this.game.board.GetPosition(pos)) {
				break;
			}

			this.game.board.AddPseudoMove(pos, this.color, this);
		}
	}

	moveTo(position: Position): boolean {
		if (!this.isValidMove(position)) {
			return false;
		}

		if (
			this.game.enPassentPossible &&
			position.Equals(this.game.enPassentPossible)
		) {
			const enPassentPos = new Position(
				position.row + (this.color === "w" ? 1 : -1),
				position.col
			);

			this.game.board.DeletePiece(
				this.game.board.GetPosition(enPassentPos)!
			);
		}

		super.moveTo(position);
		return true;
	}

	clone(g: Game): Piece {
		return new Pawn(this.position, this.color, g);
	}
}
