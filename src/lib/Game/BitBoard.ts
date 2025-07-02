const whitePawns = 0x000000000000ff00n;
const blackPawns = 0x00ff000000000000n;

const whiteKnights = 0x0000000000000042n;
const blackKnights = 0x4200000000000000n;

const whiteBishops = 0x0000000000000024n;
const blackBishops = 0x2400000000000000n;

const whiteRooks = 0x0000000000000081n;
const blackRooks = 0x8100000000000000n;

const whiteQueens = 0x0000000000000008n;
const blackQueens = 0x0800000000000000n;

const whiteKings = 0x0000000000000010n;
const blackKings = 0x1000000000000000n;

const whitePieces =
	whitePawns |
	whiteKnights |
	whiteBishops |
	whiteRooks |
	whiteQueens |
	whiteKings;
const blackPieces =
	blackPawns |
	blackKnights |
	blackBishops |
	blackRooks |
	blackQueens |
	blackKings;

const allPieces = whitePieces | blackPieces;

export function GetPieceAtPosition(index: number): string {
	const mask = 1n << BigInt(index);
	if (whitePawns & mask) {
		return "P";
	} else if (blackPawns & mask) {
		return "p";
	} else if (whiteKnights & mask) {
		return "N";
	} else if (blackKnights & mask) {
		return "n";
	} else if (whiteBishops & mask) {
		return "B";
	} else if (blackBishops & mask) {
		return "b";
	} else if (whiteRooks & mask) {
		return "R";
	} else if (blackRooks & mask) {
		return "r";
	} else if (whiteQueens & mask) {
		return "Q";
	} else if (blackQueens & mask) {
		return "q";
	} else if (whiteKings & mask) {
		return "K";
	} else if (blackKings & mask) {
		return "k";
	}
	return "";
}
