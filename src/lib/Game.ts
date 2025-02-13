import { Bishop } from "./pieces/Bishop";
import { King } from "./pieces/King";
import { Knight } from "./pieces/Knight";
import { Pawn } from "./pieces/Pawn";
import { Piece, Position } from "./pieces/Piece";
import { Queen } from "./pieces/Queen";
import { Rook } from "./pieces/Rook";

const Pieces: { [key: string]: typeof Piece } = {
	R: Rook,
	Kn: Knight,
	B: Bishop,
	Q: Queen,
	K: King,
	P: Pawn,
};

const StartPos: string[] = ["R", "Kn", "B", "Q", "K", "B", "Kn", "R"];

const PawnRow: string[] = new Array(8).fill("P", 0, 8);

export class Game {
	private updateState: () => void;
	board: (Piece | undefined)[][] = [];
	highlitedSquares: Position[] = [];
	selectedPiece: Piece | undefined;
	currentMove: "b" | "w" = "w";
	checked: boolean = false;

	constructor(updateState: () => void) {
		this.updateState = updateState;
		this.generateGameBoard();
		this.populateGameBoard();
	}

	generateGameBoard() {
		for (let y = 0; y < 8; y++) {
			const row: undefined[] = [];

			for (let x = 0; x < 8; x++) {
				row.push(undefined);
			}

			this.board.push(row);
		}
	}

	private populateGameRow(
		pieces: (string | undefined)[],
		row: number,
		color: "w" | "b"
	) {
		pieces.forEach((p, index) => {
			if (!p) return;

			if (row > this.board.length - 1) {
				console.error(
					`${row} is out of bounds of board ${this.board.length - 1}`
				);
				return;
			}

			if (index > this.board[row].length - 1) {
				console.error(
					`${index} is out of bounds of row ${row} range of ${
						this.board[row].length - 1
					}`
				);
				return;
			}

			const piece = Pieces[p];

			if (!piece) {
				console.error(`${p} does not exist in Pieces list!`);
				return;
			}

			this.board[row][index] = new piece([row, index], color, this);
		});

		this.updateState();

		this.board.forEach((row) => {
			row.forEach((piece) => {
				if (piece) {
					piece.getValidSquares();
				}
			});
		});
	}

	populateGameBoard() {
		this.populateGameRow(StartPos, 0, "b");
		this.populateGameRow(PawnRow, 1, "b");
		this.populateGameRow(PawnRow, 6, "w");
		this.populateGameRow(StartPos, 7, "w");
	}

	movePiece(
		fromPos: Position,
		toPos: Position,
		fromMainBoard: boolean = true
	) {
		let piece: Piece | undefined = this.getSquare(fromPos);

		if (piece === undefined) {
			console.error(`From piece is not at ${fromPos}`);
			this.selectPiece(undefined);
			return;
		}

		this.selectPiece(undefined);

		if (fromMainBoard && this.moveMakeCheck(fromPos, toPos)) {
			return;
		}

		if (!piece.moveTo(toPos)) {
			return;
		}

		if (
			piece.identifier === "P" &&
			this.canPawnPromote(piece.position[0], piece.color)
		) {
			piece = new Queen(piece.position, piece.color, this);
			this.board[piece.position[0]][piece.position[1]] = piece;
		}

		this.currentMove = this.currentMove === "w" ? "b" : "w";

		this.board.forEach((row) => {
			row.forEach((piece) => {
				if (piece) {
					piece.getValidSquares();
				}
			});
		});

		this.checked = this.isInCheck(this.currentMove);

		this.updateState();
	}

	private canPawnPromote(yPos: number, color: "w" | "b"): boolean {
		return (color === "w" && yPos === 0) || (color === "b" && yPos === 7);
	}

	moveMakeCheck(fromPos: Position, toPos: Position): boolean {
		const gameClone = new Game(() => {});

		gameClone.board = this.board.map((row) =>
			row.map((piece) => (piece ? piece.clone(gameClone) : undefined))
		);
		gameClone.currentMove = this.currentMove;
		gameClone.checked = this.checked;

		gameClone.board.forEach((row) => {
			row.forEach((piece) => {
				if (piece) {
					piece.getValidSquares();
				}
			});
		});

		gameClone.movePiece(fromPos, toPos, false);

		if (gameClone.isInCheck(this.currentMove)) {
			return true;
		}

		return false;
	}

	selectPiece(piece: Piece | undefined) {
		this.selectedPiece = piece;
		this.highlitedSquares = piece ? piece.validSquares : [];

		if (piece) {
			this.highlitedSquares = this.highlitedSquares
				.map((sq) =>
					this.moveMakeCheck(piece.position, sq) ? undefined : sq
				)
				.filter((eq) => eq !== undefined);
		}

		this.updateState();
	}

	getSquare([y, x]: Position) {
		if (!this.isPosInBounds([y, x])) {
			return undefined;
		}

		return this.board[y][x];
	}

	public selectSquare(position: Position) {
		const piece: Piece | undefined = this.getSquare(position);

		if (!piece) {
			if (this.selectedPiece) {
				this.movePiece(this.selectedPiece.position, position);
			}

			return;
		}

		if (this.selectedPiece) {
			if (this.selectedPiece.color === piece.color) {
				this.selectPiece(piece);
			} else {
				this.movePiece(this.selectedPiece.position, piece.position);
			}

			return;
		}

		if (piece && piece.color === this.currentMove) {
			this.selectPiece(piece);
			return;
		}

		this.selectPiece(undefined);
	}

	isSquareAttacked(position: Position, color: "w" | "b") {
		if (!this.isPosInBounds(position)) return false;

		let attacked = false;

		this.board.forEach((row) => {
			if (attacked) return;

			row.forEach((square) => {
				if (attacked || !square) return;

				if (square.color === color) return;

				if (
					square.attackingSquares.some(
						(square) =>
							square[0] === position[0] &&
							square[1] === position[1]
					)
				) {
					attacked = true;
					return;
				}
			});
		});

		return attacked;
	}

	findKing(color: "w" | "b"): Position {
		for (const row of this.board) {
			for (const piece of row) {
				if (!piece) continue;

				if (piece.identifier === "K" && piece.color === color) {
					return piece.position;
				}
			}
		}

		throw Error(`${color} king not found!`);
	}

	isInCheck(color: "w" | "b") {
		const kingPos = this.findKing(color);

		return this.isSquareAttacked(kingPos, color);
	}

	isPosInBounds(position: Position): boolean {
		return (
			position[0] < this.board.length &&
			position[0] >= 0 &&
			position[1] >= 0 &&
			position[1] < this.board[position[0]].length
		);
	}
}
