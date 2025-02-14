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

		this.validSquares = [];

		this.attackingSquares.forEach((position) => {
			const sq = this.game.getSquare(position);

			if (sq) {
				if (sq.color !== this.color) {
					this.validSquares.push(position);
				}

				return;
			}

			if (position[1] !== this.position[1]) {
				return;
			}

			this.validSquares.push(position);
		});
	}

	getAttackingSquares() {
		this.attackingSquares = [];

		let attackDirection = -1;
		const attackTotal = 1 + (this.firstMove ? 1 : 0);

		if (this.color === "w") {
			attackDirection = 1;
		}

		for (let a = 1; a <= attackTotal; a += 1) {
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

		this.firstMove = false;
		super.moveTo(position);
		return true;
	}

	clone(g: Game): Piece {
		return new Pawn(this.position, this.color, g);
	}
}
