import { Game } from "../Game";
import { Piece, Position } from "./Piece";

export class Pawn extends Piece {
	identifier: string = "P";
	firstMove: boolean = true;

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);
	}

	getValidSquares(): void {
		this.getAttackingSquares();

		this.validSquares = this.attackingSquares;
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

			const sq = this.game.getSquare(pos);

			if (sq) {
				break;
			}

			this.attackingSquares.push(pos);
		}

		// Diagonal Take Attacks
		this.attackingSquares.push([
			this.position[0] - attackDirection,
			this.position[1] + 1,
		]);

		this.attackingSquares.push([
			this.position[0] - attackDirection,
			this.position[1] - 1,
		]);
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
