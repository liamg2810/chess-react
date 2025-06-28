import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { KingMovement, Piece } from "./Piece";

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

			const sq = this.game.board.GetPosition(position);

			if (sq) {
				if (sq.color === this.color) {
					return;
				}

				this.validSquares.push(position);
				return;
			}

			this.validSquares.push(position);
		});

		if (this.canCastleKingSide()) {
			this.kingSideCastlePos = new Position(
				this.position.row,
				this.position.col + this.kingSideDir * 2
			);
			this.validSquares.push(this.kingSideCastlePos);
		} else {
			this.kingSideCastlePos = undefined;
		}

		if (this.canCastleQueenSide()) {
			this.queenSideCastlePos = new Position(
				this.position.row,
				this.position.col + this.queenSideDir * 2
			);
			this.validSquares.push(this.queenSideCastlePos);
		} else {
			this.queenSideCastlePos = undefined;
		}
	}

	getAttackingSquares(): void {
		this.attackingSquares = [];

		for (const [dx, dy] of KingMovement) {
			let pos: Position;

			try {
				pos = new Position(
					this.position.row + dx,
					this.position.col + dy
				);
			} catch {
				// If the position is out of bounds, skip it
				return;
			}

			this.attackingSquares.push(pos);
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

			const pos: Position = new Position(
				this.position.row,
				this.position.col + sideDir * i
			);

			// Queen side castling can ignore B1 being attacked
			if (sideLength <= 2) {
				emptySquares =
					this.game.board.GetPosition(pos) === undefined &&
					!this.game.isSquareAttacked(pos, this.color);
			}
		}

		return emptySquares;
	}

	private getSideRook(
		sideLength: number,
		sideDir: number
	): Piece | undefined {
		const sideRook = this.game.board.GetPosition(
			new Position(
				this.position.row,
				this.position.col + sideLength * sideDir + sideDir
			)
		);

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

		if (
			this.queenSideCastlePos &&
			position.Equals(this.queenSideCastlePos)
		) {
			const sideRook = this.getSideRook(3, this.queenSideDir);

			if (!sideRook) return false;

			sideRook.moveTo(
				new Position(
					this.position.row,
					this.position.col + this.queenSideDir
				)
			);
		} else if (
			this.kingSideCastlePos &&
			position.Equals(this.kingSideCastlePos)
		) {
			const sideRook = this.getSideRook(2, this.kingSideDir);

			if (!sideRook) return false;

			sideRook.moveTo(
				new Position(
					this.position.row,
					this.position.col + this.kingSideDir
				)
			);
		}

		return super.moveTo(position);
	}

	clone(g: Game): Piece {
		return new King(this.position, this.color, g);
	}
}
