import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { Piece } from "./Piece";

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

			if (
				this.game.enPassentPossible &&
				position.Equals(this.game.enPassentPossible)
			) {
				this.validSquares.push(position);
				return;
			}

			const sq = this.game.board.GetPosition(position);

			if (sq) {
				if (sq.color !== this.color) {
					this.validSquares.push(position);
				}

				return;
			}

			if (position.col !== this.position.col) {
				return;
			}

			this.validSquares.push(position);
		});

		let attackDirection = 1;
		const attackTotal = 1 + (this.firstMove ? 1 : 0);

		if (this.color === "w") {
			attackDirection = -1;
		}

		for (let a = attackTotal; a >= 1; a -= 1) {
			let pos: Position;
			try {
				pos = new Position(
					this.position.row + attackDirection * a,
					this.position.col
				);
			} catch {
				// Pos out of bounds, skip it
				continue;
			}

			if (this.game.board.GetPosition(pos)) {
				continue;
			}

			if (!this.game.isClone) {
				if (this.game.moveMakeCheck(this.position, pos, this.color)) {
					continue;
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
		try {
			this.attackingSquares.push(
				new Position(
					this.position.row - attackDirection,
					this.position.col + 1
				)
			);
		} catch {
			// If the position is out of bounds, skip it
		}

		try {
			this.attackingSquares.push(
				new Position(
					this.position.row - attackDirection,
					this.position.col - 1
				)
			);
		} catch {
			// If the position is out of bounds, skip it
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

			this.game.board.pieces = this.game.board.pieces.filter((piece) => {
				return !piece.position.Equals(enPassentPos);
			});
		}

		this.firstMove = false;
		super.moveTo(position);
		return true;
	}

	clone(g: Game): Piece {
		return new Pawn(this.position, this.color, g);
	}
}
