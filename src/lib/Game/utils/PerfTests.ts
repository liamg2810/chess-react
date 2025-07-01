import { Game } from "../Game";
import { Move } from "../Move";
// import { ParseFen } from "./FEN";
import { NotationToPosition } from "./Notation";
// import { ExpectedDepth1Divide } from "./PerftConstants";

function RecusivelyRunMoves(ply: number, game: Game): number {
	if (ply === 0) {
		return 1;
	}

	const legalMoves = [...game.board.legalMoves];

	let total = 0;

	for (const [square, pieces] of legalMoves) {
		const position = NotationToPosition(square);

		for (const piece of pieces) {
			if (piece.color !== game.currentMove) {
				continue; // Skip moves for the opponent's pieces
			}

			const fromPosition = piece.position;

			// let start = performance.now();

			const move = new Move(fromPosition, position, piece, game.board);

			game.board.MovePiece(move, true);
			// let end = performance.now();
			// console.log(
			// 	`Move created and executed in ${
			// 		end - start
			// 	}ms: ${fromPosition.ToCoordinate()} to ${position.ToCoordinate()}`
			// );

			total += RecusivelyRunMoves(ply - 1, game);

			game.checkmate = false; // Reset checkmate state
			game.draw = false; // Reset draw state
			game.gameOver = false; // Reset game over state

			// start = performance.now();
			move.UnMakeMove(true);
			// end = performance.now();
			// console.log(
			// 	`Move undone in ${
			// 		end - start
			// 	}ms: ${fromPosition.ToCoordinate()} to ${position.ToCoordinate()}`
			// );
		}
	}

	return total;
}

// function PerftDivide(ply: number, game: Game, currentFen: string): number {
// 	let total = 0;

// 	// Iterate over all legal moves
// 	game.board.legalMoves.forEach((pieces, square) => {
// 		const to = NotationToPosition(square);

// 		for (const fromPiece of pieces) {
// 			// Set up new game state for this move
// 			const newGame = new Game(() => {}, true);
// 			newGame.crippleStockfish = true;
// 			ParseFen(currentFen, newGame.board);

// 			newGame.moves = game.moves.map((move) => [...move]);

// 			// newGame.board.MovePiece(fromPiece.position, to);

// 			// Count resulting nodes using your function
// 			const count = RecusivelyRunMoves(ply - 1, newGame);

// 			const moveNotation =
// 				fromPiece.position.ToCoordinate() + to.ToCoordinate();

// 			if (ExpectedDepth1Divide[moveNotation] !== count) {
// 				console.warn(
// 					`Expected ${moveNotation} to have ${ExpectedDepth1Divide[moveNotation]} nodes, but got ${count}`
// 				);
// 			}

// 			total += count;

// 			break;
// 		}
// 	});

// 	console.log(`Total nodes: ${total}`);
// 	return total;
// }

// Run each move to count iterations of positions
export function RunPerfTests(ply: number, game: Game) {
	game.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

	console.log(`Running Perft for ${ply} plies...`);

	const start = performance.now();

	const count = RecusivelyRunMoves(ply, game);

	// console.log("Current FEN:", game.board.fen);

	// const counts = PerftDivide(ply, game, game.board.fen);

	// console.log("Counts for each move:", counts);

	const end = performance.now();
	const timeTaken = end - start;

	console.log(`Total positions evaluated for ply ${ply}: ${count}`);
	console.log(`Time taken for ${ply} plies: ${timeTaken.toFixed(2)} ms`);

	// console.log(`Time taken for ${ply} plies: ${timeTaken} ms`);
	// console.log(`Total positions evaluated for ply: ${ply}, ${count}`);

	// return count;
}
