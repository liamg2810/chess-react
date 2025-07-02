import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { NotationToPosition } from "../Game/utils/Notation";
import { Piece } from "./Piece";

export class Pawn extends Piece {
	identifier: string = "P";

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	calcHasMoved(): boolean {
		if (this.color === "w") {
			return this.position.row !== 6; // White pawns start on row 6.
		}
		return this.position.row !== 1; // Black pawns start on row 1.
	}

	canEP(position: Position): boolean {
		return (
			((position.row === 3 && this.color === "w") ||
				(position.row === 4 && this.color === "b")) &&
			this.game.enPassentPossible !== undefined &&
			this.game.enPassentPossible.Equals(position)
		);
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
		this.hasMoved = this.calcHasMoved();

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

			if ((sq && sq.color !== this.color) || this.canEP(leftPos)) {
				this.game.board.AddPseudoMove(leftPos, this.color, this);
			}
		}

		if (Position.IsValid(row, rightCol)) {
			const rightPos = new Position(row, rightCol);

			const sq = this.game.board.GetPosition(rightPos);

			if ((sq && sq.color !== this.color) || this.canEP(rightPos)) {
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
			position.Equals(this.game.enPassentPossible) &&
			this.canEP(position)
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
