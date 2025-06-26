import { Game } from "../Game/Game";
import { arraysEqual } from "../utils";
import { KingMovement, Piece, Position } from "./Piece";

export class King extends Piece {
	identifier: string = "K";
	hasMoved: boolean = false;
	kingSideCastlePos: Position | undefined;
	queenSideCastlePos: Position | undefined;
	queenSideDir: number = -1;
	kingSideDir: number = 1;
	value: number = 0; // King has no value in terms of material, but is crucial for the game.

	constructor(position: Position, color: "w" | "b", game: Game) {
		super(position, color, game);

		this.queenSideDir = -1;
		this.kingSideDir = 1;
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

			if (this.game.isSquareAttacked(position, this.color)) {
				return;
			}

			const sq = this.game.board.GetSquare(position);

			if (sq) {
				if (sq.color === this.color) {
					return;
				}

				this.validSquares.push(position);
				return;
			}

			this.validSquares.push(position);

			if (position[0] === 2 && position[1] === 1) {
				console.warn(`King is trying to move to 2, 1. Piece: ${sq}`);
				console.warn(`Valid squares: ${this.validSquares}`);
			}
		});

		if (this.canCastleKingSide()) {
			this.kingSideCastlePos = [
				this.position[0],
				this.position[1] + this.kingSideDir * 2,
			];
			this.validSquares.push(this.kingSideCastlePos);
		} else {
			this.kingSideCastlePos = undefined;
		}

		if (this.canCastleQueenSide()) {
			this.queenSideCastlePos = [
				this.position[0],
				this.position[1] + this.queenSideDir * 2,
			];
			this.validSquares.push(this.queenSideCastlePos);
		} else {
			this.queenSideCastlePos = undefined;
		}
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		for (const [dx, dy] of KingMovement) {
			const [x, y] = this.position;
			const pos: Position = [x + dx, y + dy];

			if (this.game.board.IsPosInBounds(pos)) {
				this.attackingSquares.push(pos);
			}
		}
	}

	canCastleSide(sideLength: number = 2, sideDir: number): boolean {
		if (this.hasMoved) {
			return false;
		}

		const sideRook = this.getSideRook(sideLength, sideDir);

		if (!sideRook) return false;

		let emptySquares = true;

		for (let i = 1; i <= sideLength; i++) {
			if (!emptySquares) {
				break;
			}

			const pos: Position = [
				this.position[0],
				this.position[1] + sideDir * i,
			];

			// Queen side castling can ignore B1 being attacked
			if (sideLength <= 2) {
				emptySquares =
					this.game.board.GetSquare(pos) === undefined &&
					!this.game.isSquareAttacked(pos, this.color);
			}
		}

		return emptySquares;
	}

	private getSideRook(
		sideLength: number,
		sideDir: number
	): Piece | undefined {
		const sideRook = this.game.board.GetSquare([
			this.position[0],
			this.position[1] + sideLength * sideDir + sideDir,
		]);

		if (!sideRook) return;

		if (sideRook.color !== this.color) return;

		if (sideRook.identifier !== "R") return;

		if (sideRook.hasMoved) return;

		return sideRook;
	}

	canCastleKingSide(): boolean {
		return (
			this.canCastleSide(2, this.kingSideDir) &&
			!this.game.isInCheck(this.color)
		);
	}

	canCastleQueenSide(): boolean {
		return (
			this.canCastleSide(3, this.queenSideDir) &&
			!this.game.isInCheck(this.color)
		);
	}

	// [Queen side, King side]
	castleRights(): [boolean, boolean] {
		if (this.hasMoved) return [false, false];

		let queenSideRights = true;
		let kingSideRights = true;

		const queenSideRook = this.getSideRook(3, this.queenSideDir);

		if (!queenSideRook || queenSideRook.identifier !== "R") {
			queenSideRights = false;
		} else {
			if (queenSideRook.hasMoved) queenSideRights = false;
		}

		const kingSideRook = this.getSideRook(2, this.kingSideDir);

		if (!kingSideRook || kingSideRook.identifier !== "R") {
			kingSideRights = false;
		} else {
			if (kingSideRook.hasMoved) kingSideRights = false;
		}

		return [queenSideRights, kingSideRights];
	}

	// Hack set castle rights by forcing rook to flag a move
	setCastleRights(side: "k" | "q", canCastle: boolean): void {
		if (side === "k") {
			const rook = this.getSideRook(2, this.kingSideDir);
			if (rook) {
				rook.hasMoved = !canCastle;
			}
		} else {
			const rook = this.getSideRook(3, this.queenSideDir);
			if (rook) {
				rook.hasMoved = !canCastle;
			}
		}
	}

	moveTo(position: Position): boolean {
		if (!this.isValidMove(position)) {
			console.log("Invalid move for King", this.position, position);
			console.log("Valid squares:", this.validSquares);
			return false;
		}

		if (arraysEqual(position, this.queenSideCastlePos || [])) {
			const sideRook = this.getSideRook(3, this.queenSideDir);

			if (!sideRook) return false;

			sideRook.moveTo([
				this.position[0],
				this.position[1] + this.queenSideDir,
			]);
		} else if (arraysEqual(position, this.kingSideCastlePos || [])) {
			const sideRook = this.getSideRook(2, this.kingSideDir);

			if (!sideRook) return false;

			sideRook.moveTo([
				this.position[0],
				this.position[1] + this.kingSideDir,
			]);
		}

		return super.moveTo(position);
	}

	clone(g: Game): Piece {
		return new King(this.position, this.color, g);
	}
}
