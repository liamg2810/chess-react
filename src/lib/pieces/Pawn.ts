import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class Pawn extends Piece {
	identifier: string = "P";
	firstMove: boolean = true;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getAttackingSquares() {
		this.attackingSquares = [];

		let attackDirection = -1;
		const attackTotal = 1 + (this.firstMove ? 1 : 0);

		if (this.color === "w") {
			attackDirection = 1;
		}

		for (let a = attackTotal; a > 0; a -= 1) {
			const pos: Position = [
				this.position[0] - attackDirection * a,
				this.position[1],
			];

			if (!this.game.isPosInBounds(pos)) {
				continue;
			}

			if (this.game.getSquare(pos)) {
				break;
			}

			this.attackingSquares.push(pos);
		}

		let pos: Position = [
			this.position[0] - attackDirection,
			this.position[1] + 1,
		];

		if (
			this.game.getSquare(pos) &&
			this.game.getSquare(pos)?.color !== this.color
		) {
			this.attackingSquares.push(pos);
		}

		pos = [this.position[0] - attackDirection, this.position[1] - 1];

		if (
			this.game.getSquare(pos) &&
			this.game.getSquare(pos)?.color !== this.color
		) {
			this.attackingSquares.push(pos);
		}
	}

	moveTo(position: Position): boolean {
		if (!this.isValidMove(position)) {
			return false;
		}
		console.log(this.firstMove);
		this.firstMove = false;
		super.moveTo(position);
		return true;
	}
}
