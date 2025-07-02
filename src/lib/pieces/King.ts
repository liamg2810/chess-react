import { Game } from "../Game/Game";
import { Position } from "../Game/Position";
import { NotationToPosition } from "../Game/utils/Notation";
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
		KingMovement.forEach(([x, y]) => {
			const row = this.position.row + x;
			const col = this.position.col + y;

			if (!Position.IsValid(row, col)) {
				return;
			}

			const position = new Position(row, col);

			const sq = this.game.board.GetPosition(position);

			if (sq) {
				if (sq.color === this.color) {
					return;
				}

				this.game.board.AddPseudoMove(position, this.color, this);
				return;
			}

			this.game.board.AddPseudoMove(position, this.color, this);
		});

		if (this.canCastleKingSide()) {
			this.kingSideCastlePos = new Position(
				this.position.row,
				this.position.col + this.kingSideDir * 2
			);
			this.game.board.AddPseudoMove(
				this.kingSideCastlePos,
				this.color,
				this
			);
		} else {
			this.kingSideCastlePos = undefined;
		}

		if (this.canCastleQueenSide()) {
			this.queenSideCastlePos = new Position(
				this.position.row,
				this.position.col + this.queenSideDir * 2
			);
			this.game.board.AddPseudoMove(
				this.queenSideCastlePos,
				this.color,
				this
			);
		} else {
			this.queenSideCastlePos = undefined;
		}
	}

	canCastleSide(sideLength: number = 2, sideDir: number): boolean {
		if (this.hasMoved) {
			return false;
		}

		const sideRook = this.getSideRook(sideLength, sideDir);

		if (!sideRook) {
			return false;
		}

		let emptySquares = true;
		let attackingSquares = false;

		for (let i = 1; i <= sideLength; i++) {
			if (!emptySquares) {
				break;
			}

			const pos: Position = new Position(
				this.position.row,
				this.position.col + sideDir * i
			);

			emptySquares = emptySquares && !this.game.board.GetPosition(pos);

			if (sideLength <= 2) {
				attackingSquares =
					attackingSquares ||
					this.game.isSquareAttacked(pos, this.color);
			}
		}

		return emptySquares && !attackingSquares;
	}

	private getSideRook(
		sideLength: number,
		sideDir: number
	): Piece | undefined {
		const col = this.position.col + (sideLength + 1) * sideDir;

		if (!Position.IsValid(this.position.row, col)) return;

		const sideRook = this.game.board.GetPosition(
			new Position(this.position.row, col)
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
