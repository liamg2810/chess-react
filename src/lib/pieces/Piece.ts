import { Game } from "../Game";

export type Position = [number, number];

export const CardinalDirections = [
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
];

export const DiagonalDirections = [
	[1, 1],
	[1, -1],
	[-1, -1],
	[-1, 1],
];

export const KnightMovement = [
	[2, 1],
	[2, -1],
	[-2, 1],
	[-2, -1],
	[1, 2],
	[1, -2],
	[-1, 2],
	[-1, -2],
];

export const KingMovement = [
	[1, -1],
	[1, 0],
	[1, 1],
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, 1],
	[0, -1],
];

export class Piece {
	position: Position = [0, 0];
	color: "w" | "b" = "b";
	attackingSquares: Position[] = [];
	validSquares: Position[] = [];
	game: Game;
	identifier: string = "P";

	constructor(position: Position, color: "w" | "b", game: Game) {
		this.position = position;
		this.color = color;
		this.game = game;
	}

	moveTo(position: Position): boolean {
		const oldPos = this.position;

		if (!this.isValidMove(position)) {
			return false;
		}

		this.position = position;

		this.game.board[position[0]][position[1]] = this;
		this.game.board[oldPos[0]][oldPos[1]] = undefined;

		this.getAttackingSquares();

		return true;
	}

	isValidMove(position: Position): boolean {
		return (
			this.validSquares.some(
				(square) =>
					square[0] === position[0] && square[1] === position[1]
			) && this.game.isPosInBounds(position)
		);
	}

	getAttackingSquares() {
		throw Error("Get Attacking Squares Is Not Implemented.");
	}

	getValidSquares() {
		throw Error("Get Valid Squares Is Not Implemented.");
	}
}
