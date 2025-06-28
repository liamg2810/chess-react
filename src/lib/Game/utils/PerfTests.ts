import { Game } from "../Game";

function RecusivelyRunMoves(
	ply: number,
	game: Game,
	currentFen: string,
	count: number
): number {
	if (ply <= 0) {
		return count + 1;
	}

	for (const piece of game.board.pieces) {
		if (piece.color !== game.currentMove) continue;

		piece.getValidSquares();

		for (const position of piece.validSquares) {
			// Clone the game for the next move
			const nextGame = new Game(() => {}, true); // true = clone mode
			try {
				nextGame.LoadFen(currentFen);
			} catch (error) {
				console.error("Error loading FEN:", currentFen, error);
				continue; // Skip this iteration if FEN is invalid
			}
			nextGame.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

			nextGame.board.MovePiece(piece.position, position);

			count = RecusivelyRunMoves(
				ply - 1,
				nextGame,
				nextGame.board.fen,
				count
			);
		}
	}

	return count;
}

// Run each move to count iterations of positions
export function RunPerfTests(ply: number, game: Game): number {
	game.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

	const start = performance.now();

	const currentFen = game.board.fen;

	const count = RecusivelyRunMoves(ply, game, currentFen, 0);

	const end = performance.now();
	const timeTaken = end - start;

	console.log(`Time taken for ${ply} plies: ${timeTaken} ms`);
	console.log(`Average time per ply: ${timeTaken / ply} ms`);
	console.log(`Total positions evaluated for ply: ${ply}, ${count}`);

	return count;
}
