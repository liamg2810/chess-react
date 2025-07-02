import { StartFen } from "../Board";
import { Game } from "../Game";
import { Move } from "../Move";
import { ParseFen } from "./FEN";
// import { ParseFen } from "./FEN";
import { NotationToPosition } from "./Notation";
import {
	ExpectedDepth1Divide,
	ExpectedDepth4Divide,
	ExpectedDepth4DivideA2A3,
	ExpectedDepth4DivideA2A3B8C6,
	ExpectedDepth4DivideA2A3C7C5,
	ExpectedDepth4DivideA2A3C7C5B2B4,
	ExpectedDepthA2A3,
	ExpectedDepthA2A3B8C6E2E3,
} from "./PerftConstants";
// import { ExpectedDepth1Divide } from "./PerftConstants";

const Divide = false;
const fen = StartFen; // Use the starting position for testing

function RecusivelyRunMoves(ply: number, game: Game): number {
	if (ply <= 0) {
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

function PerftDivide(ply: number, game: Game): number {
	let total = 0;

	const legalMoves = [...game.board.legalMoves];

	// Iterate over all legal moves
	for (const [square, pieces] of legalMoves) {
		const position = NotationToPosition(square);

		for (const piece of pieces) {
			if (piece.color !== game.currentMove) {
				continue; // Skip moves for the opponent's pieces
			}

			const fromPosition = piece.position;

			const notation =
				fromPosition.ToCoordinate() + position.ToCoordinate();
			// let start = performance.now();

			const move = new Move(fromPosition, position, piece, game.board);

			game.board.MovePiece(move, true);

			const count = RecusivelyRunMoves(ply - 1, game);

			if (ExpectedDepth4Divide[notation] !== count) {
				console.warn(
					`Expected ${notation} to have ${ExpectedDepth4Divide[notation]} nodes, but got ${count}`
				);
				console.log(`Moves:`);
				console.log([...game.board.legalMoves]);
			}

			total += count;

			move.UnMakeMove(true);
		}
	}

	console.log(`Total nodes: ${total}`);
	return total;
}

// Run each move to count iterations of positions
export function RunPerfTests(ply: number, game: Game) {
	game.crippleStockfish = true; // Disable stockfish to avoid performance issues during tests

	ParseFen(fen, game.board);

	console.log(`Running Perft for ${ply} plies...`);

	if (Divide) {
		console.log("Running Perft Divide...");
		const counts = PerftDivide(ply, game);
		console.log("Total nodes found:", counts);
	} else {
		console.log("Running Recursively Run Moves...");
		const start = performance.now();
		const count = RecusivelyRunMoves(ply, game);
		const end = performance.now();
		const timeTaken = end - start;

		console.log(`Total positions evaluated for ply ${ply}: ${count}`);
		console.log(`Time taken for ${ply} plies: ${timeTaken.toFixed(2)} ms`);
	}

	// const count = RecusivelyRunMoves(ply, game);

	// console.log(`Time taken for ${ply} plies: ${timeTaken} ms`);
	// console.log(`Total positions evaluated for ply: ${ply}, ${count}`);

	// return count;
}
