import { Game } from "../Game";
import { arraysEqual } from "../utils";
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
			if (!this.game.isClone) {
				if (
					this.game.moveMakeCheck(this.position, position, this.color)
				) {
					return;
				}
			}

			if (arraysEqual(position, this.game.enPassentPossible || [])) {
				this.validSquares.push(position);
				return;
			}

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

			if (!this.game.isClone) {
				if (this.game.moveMakeCheck(this.position, pos, this.color)) {
					return;
				}
			}

			this.validSquares.push(pos);
		}
	}

	getAttackingSquares() {
		this.attackingSquares = [];

		let attackDirection = -1;

		if (this.color === "w") {
			attackDirection = 1;
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

		if (arraysEqual(position, this.game.enPassentPossible || [])) {
			const pawnToRemovePos: Position = [this.position[0], position[1]];

			this.game.board[pawnToRemovePos[0]][pawnToRemovePos[1]] = undefined;
		}

		this.firstMove = false;
		super.moveTo(position);
		return true;
	}

	clone(g: Game): Piece {
		return new Pawn(this.position, this.color, g);
	}
}
