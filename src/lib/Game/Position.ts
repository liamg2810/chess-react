export class Position {
	row: number;
	col: number;

	constructor(row: number, col: number) {
		if (!Position.IsValid(row, col)) {
			throw new Error(`Position out of bounds: (${row}, ${col})`);
		}

		this.row = row;
		this.col = col;
	}

	static IsValid(row: number, col: number): boolean {
		return row >= 0 && row < 8 && col >= 0 && col < 8;
	}

	Equals(other: Position): boolean {
		return this.row === other.row && this.col === other.col;
	}

	ToCoordinate(): string {
		const colLetter = String.fromCharCode(97 + this.col); // 'a' is 97 in ASCII
		return `${colLetter}${8 - this.row}`; // 8 - row to convert to chess notation
	}

	Set(position: Position): Position {
		if (!Position.IsValid(position.row, position.col)) {
			throw new Error(
				`Position out of bounds: (${position.row}, ${position.col})`
			);
		}

		this.row = position.row;
		this.col = position.col;

		return this;
	}

	Subtract(other: Position): Position {
		return new Position(this.row - other.row, this.col - other.col);
	}
}
