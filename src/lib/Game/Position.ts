export class Position {
	row: number;
	col: number;

	constructor(row: number, col: number) {
		this.row = row;
		this.col = col;

		if (!this.IsInBounds()) {
			throw new Error(`Position out of bounds: (${row}, ${col})`);
		}
	}

	IsInBounds(): boolean {
		return this.row >= 0 && this.row < 8 && this.col >= 0 && this.col < 8;
	}

	Equals(other: Position): boolean {
		return this.row === other.row && this.col === other.col;
	}

	ToCoordinate(): string {
		const colLetter = String.fromCharCode(97 + this.col); // 'a' is 97 in ASCII
		return `${colLetter}${8 - this.row}`; // 8 - row to convert to chess notation
	}

	Set(position: Position): Position {
		this.row = position.row;
		this.col = position.col;

		if (!this.IsInBounds()) {
			throw new Error(
				`Position out of bounds: (${position.row}, ${position.col})`
			);
		}

		return this;
	}
}
