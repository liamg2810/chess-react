import { Game } from "../Game";
import { NotationToPosition } from "./Notation";

const ExpectedDepth1Divide: Record<string, number> = {
	a2a3: 380,
	b2b3: 420,
	c2c3: 420,
	d2d3: 539,
	e2e3: 599,
	f2f3: 380,
	g2g3: 420,
	h2h3: 380,
	a2a4: 420,
	b2b4: 421,
	c2c4: 441,
	d2d4: 560,
	e2e4: 600,
	f2f4: 401,
	g2g4: 421,
	h2h4: 420,
	b1c3: 440,
	g1h3: 400,
	b1a3: 400,
	g1f3: 440,
};

const ExpectedDepthA2A3: Record<string, number> = {
	a7a6: 19,
	b7b6: 19,
	c7c6: 19,
	d7d6: 19,
	e7e6: 19,
	f7f6: 19,
	g7g6: 19,
	h7h6: 19,
	a7a5: 19,
	b7b5: 19,
	c7c5: 19,
	d7d5: 19,
	e7e5: 19,
	f7f5: 19,
	g7g5: 19,
	h7h5: 19,
	b8a6: 19,
	b8c6: 19,
	g8f6: 19,
	g8h6: 19,
};

const ExpectedDepthA2A3B8C6: Record<string, number> = {
	b2b3: 1,
	c2c3: 1,
	d2d3: 1,
	e2e3: 1,
	f2f3: 1,
	g2g3: 1,
	h2h3: 1,
	a3a4: 1,
	b2b4: 1,
	c2c4: 1,
	d2d4: 1,
	e2e4: 1,
	f2f4: 1,
	g2g4: 1,
	h2h4: 1,
	b1c3: 1,
	g1f3: 1,
	g1h3: 1,
	a1a2: 1,
};

function RecusivelyRunMoves(
	ply: number,
	game: Game,
	currentFen: string
): number {
	if (ply === 0) {
		return 1;
	}

	let total = 0;

	game.board.legalMoves.forEach((pieces, square) => {
		const position = NotationToPosition(square);

		for (const piece of pieces) {
			const newGame = new Game(() => {}, true);
			newGame.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

			newGame.LoadFen(currentFen);

			newGame.board.MovePiece(piece.position, position);

			total += RecusivelyRunMoves(ply - 1, newGame, newGame.board.fen);
		}
	});

	return total;
}

function PerftDivide(ply: number, game: Game, currentFen: string): number {
	let total = 0;

	// Iterate over all legal moves
	game.board.legalMoves.forEach((pieces, square) => {
		const to = NotationToPosition(square);

		for (const fromPiece of pieces) {
			// Set up new game state for this move
			const newGame = new Game(() => {}, true);
			newGame.crippleStockfish = true;
			newGame.LoadFen(currentFen);

			// Count resulting nodes using your function
			const count = RecusivelyRunMoves(
				ply - 1,
				newGame,
				newGame.board.fen
			);

			const moveNotation =
				fromPiece.position.ToCoordinate() + to.ToCoordinate();
			console.log(`${moveNotation}: ${count}`);

			if (ExpectedDepthA2A3[moveNotation] !== count) {
				console.warn(
					`Expected ${moveNotation} to have ${ExpectedDepthA2A3[moveNotation]} nodes, but got ${count}`
				);
			}

			total += count;
		}
	});

	console.log(`Total nodes: ${total}`);
	return total;
}

// Run each move to count iterations of positions
export function RunPerfTests(ply: number, game: Game) {
	game.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

	const start = performance.now();

	const currentFen = game.board.fen;

	// const count = RecusivelyRunMoves(ply, game, currentFen, 0);

	const counts = PerftDivide(ply, game, currentFen);

	console.log("Counts for each move:", counts);

	const end = performance.now();
	const timeTaken = end - start;

	// console.log(`Time taken for ${ply} plies: ${timeTaken} ms`);
	// console.log(`Total positions evaluated for ply: ${ply}, ${count}`);

	// return count;
}
