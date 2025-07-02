import { Piece } from "../pieces/Piece";
import { Board } from "./Board";
import { Position } from "./Position";

export class Move {
	from: Position;
	to: Position;
	piece: Piece;
	board: Board;
	moveClock: number = 0;
	capture?: Piece;
	ep?: Position;
	check?: boolean;
	promotion?: "Q" | "R" | "B" | "N";
	notation: string = "";
	castle?: boolean;
	castleSide?: "k" | "q";
	hasMoved: boolean = true;

	constructor(from: Position, to: Position, piece: Piece, board: Board) {
		// Copy positions to avoid mutating the original ones
		this.from = from.Copy();
		this.to = to.Copy();

		this.piece = piece;
		this.board = board;

		this.notation = this.GenerateNotation();

		if (!this.Validate()) {
			throw new Error(
				`Invalid move from ${from.ToCoordinate()} to ${to.ToCoordinate()} for piece ${
					piece.identifier
				} of color ${piece.color}`
			);
		}

		// Full move clock has not yet been updated
		if (this.piece.color === "w") {
			this.moveClock = board.game.fullMoveClock;
		} else {
			this.moveClock = board.game.fullMoveClock + 1;
		}

		this.hasMoved = piece.hasMoved;

		this.IsCapture();

		if (this.IsEP()) {
			this.ep = this.to.Copy();
		}

		if (this.IsCheck()) {
			this.check = true;
		}

		if (this.IsPromotion()) {
			this.promotion = "Q"; // Default promotion to Queen, can be changed later
		}

		if (this.IsCastle()) {
			this.castle = true;
			this.castleSide = this.from.col < this.to.col ? "k" : "q";
		}
	}

	Validate(): boolean {
		if (this.from.Equals(this.to)) {
			console.error("Move from and to positions are the same");
			return false;
		}

		if (!this.piece.isValidMove(this.to)) {
			console.error(
				`Invalid move for piece ${this.piece.identifier} from ${this.from} to ${this.to}`
			);
			return false;
		}

		if (this.board.game.currentMove !== this.piece.color) {
			console.error(`It's not ${this.piece.color}'s turn to move`);
			return false;
		}

		return true;
	}

	IsCastle(): boolean {
		if (this.piece.identifier !== "K") {
			return false;
		}

		if (Math.abs(this.from.col - this.to.col) !== 2) {
			return false;
		}

		return true;
	}

	IsCapture(): boolean {
		const toPiece = this.board.GetPosition(this.to);

		if (toPiece === undefined) {
			return false;
		}

		if (toPiece.color === this.piece.color) {
			console.error(
				`Cannot capture own piece at ${this.to} with ${this.piece.identifier} of color ${this.piece.color}`
			);
			return false;
		}

		this.capture = toPiece.clone(this.board.game);
		return true;
	}

	GenerateNotation(): string {
		if (this.castle) {
			return this.castleSide === "q" ? "O-O-O" : "O-O";
		}

		let notation = "";

		if (this.check) {
			notation = "+";
		}

		if (this.board.game.checkmate) {
			notation = "#";
		}

		notation = this.to + notation;
		const fromNotation = this.from.toString();

		if (this.capture) {
			notation = "x" + notation;

			if (this.piece.identifier === "P") {
				notation = fromNotation[0] + notation;
			}
		}

		// No need to go any further
		if (this.piece.identifier === "P") {
			return notation;
		}

		const attackers = this.board.game.GetPiecesSeeingSquare(
			this.to,
			this.piece.color === "w" ? "b" : "w"
		);

		let sameRow = false;
		let sameCol = false;

		attackers.forEach((attacker) => {
			if (this.piece === attacker) return;

			if (attacker.identifier !== this.piece.identifier) return;
			if (attacker.color !== this.piece.color) return;

			if (attacker.position.row === this.from.row) sameRow = true;
			if (attacker.position.col === this.from.col) sameCol = true;
		});

		if (sameCol) {
			notation = fromNotation[1] + notation;
		}

		if (sameRow) {
			notation = fromNotation[0] + notation;
		}

		if (this.piece.identifier !== "P") {
			notation = this.piece.identifier + notation;
		}

		return notation;
	}

	IsEP(): boolean {
		return (
			this.piece.identifier === "P" &&
			((this.to.row === 3 && this.piece.color === "w") ||
				(this.to.row === 4 && this.piece.color === "b")) &&
			this.board.game.enPassentPossible !== undefined &&
			this.board.game.enPassentPossible.Equals(this.to)
		);
	}

	IsCheck(): boolean {
		const toPiece = this.board.GetPosition(this.to);

		if (toPiece === undefined) {
			return false;
		}

		return (
			toPiece.identifier === "K" &&
			toPiece.color !== this.piece.color &&
			this.board.game.moveMakeCheck(
				this.from,
				this.to,
				this.piece.color === "w" ? "b" : "w"
			)
		);
	}

	IsPromotion(): boolean {
		return (
			this.piece.identifier === "P" &&
			(this.to.row === 0 || this.to.row === 7)
		);
	}

	MakeMove(): boolean {
		if (!this.piece.moveTo(this.to)) {
			console.error(
				`Failed to move piece ${this.piece.identifier} from ${this.from} to ${this.to}`
			);
			return false;
		}

		if (this.promotion) {
			this.board.CreatePiece(
				this.piece.color === "w"
					? this.promotion.toUpperCase()
					: this.promotion.toLowerCase(),
				this.to
			);
			this.board.DeletePiece(this.piece);
		}

		this.board.game.enPassentPossible = undefined;

		if (
			this.piece.identifier === "P" &&
			Math.abs(this.from.row - this.to.row) === 2
		) {
			this.board.game.enPassentPossible = new Position(
				(this.from.row + this.to.row) / 2,
				this.from.col
			);
		}

		return true;
	}

	UnMakeMove(perft: boolean = false): boolean {
		if (!perft && this.moveClock !== this.board.game.fullMoveClock) {
			console.error(
				`Move clock mismatch: expected ${this.moveClock}, got ${this.board.game.fullMoveClock}`
			);
			return false;
		}

		this.piece.position.Set(this.from);
		if (this.capture) {
			this.board.AddPiece(this.capture);
		} else if (this.ep) {
			const epPos = new Position(
				this.ep.row + (this.piece.color === "w" ? 1 : -1),
				this.ep.col
			);

			this.board.CreatePiece(this.piece.color === "w" ? "p" : "P", epPos);

			this.board.game.enPassentPossible = this.ep;
		} else if (this.promotion) {
			const promotedPiece = this.board.GetPosition(this.to);

			if (promotedPiece) {
				this.board.DeletePiece(promotedPiece);
			}

			const pieceClone = this.piece.clone(this.board.game);

			pieceClone.position.Set(this.from);

			this.board.AddPiece(pieceClone);
		} else if (this.castle) {
			const rookCol =
				this.piece.position.col + (this.castleSide === "q" ? -1 : 1);
			const rook = this.board.GetPosition(
				new Position(this.from.row, rookCol)
			);

			if (rook) {
				if (rook.identifier !== "R") {
					console.error(
						`Expected rook at ${rook.position.ToCoordinate()} but found ${
							rook.identifier
						}`
					);
					return false;
				}

				rook.position.Set(
					new Position(this.from.row, this.castleSide === "k" ? 7 : 0)
				);

				console.log(rook.position.ToCoordinate());

				rook.hasMoved = false;
			}
		}

		this.piece.hasMoved = this.hasMoved;

		// Update full move clock
		if (this.piece.color === "b") {
			this.board.game.fullMoveClock -= 1;
		}

		this.board.game.currentMove = this.piece.color;

		this.board.UpdateValidSquares();

		if (!perft) {
			if (this.piece.color === "w") {
				this.board.game.moves.pop();
			} else {
				this.board.game.moves[this.board.game.moves.length - 1].pop();
			}

			this.board.game.selectPiece(undefined);

			this.board.game.previousMove = undefined;
			this.board.game.boardHistory.pop();
			this.board.fen = this.board.GenerateFen();
			this.board.game.updateState();
		}

		return true;
	}
}
