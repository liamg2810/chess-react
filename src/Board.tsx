import "./Board.css";
import Eval from "./Eval";
import { GetPieceAtPosition } from "./lib/Game/BitBoard";
import { Game } from "./lib/Game/Game";
import { Position } from "./lib/Game/Position";
import { Pawn } from "./lib/pieces/Pawn";

interface Props {
	game: Game | undefined;
}

function Board({ game }: Props) {
	const Empty2DBoard: null[][] = Array.from({ length: 8 }, () =>
		Array(8).fill(null)
	);

	const Rows = ["8", "7", "6", "5", "4", "3", "2", "1"];
	const Columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

	const DebugSquare = (Pos: Position) => {
		return (
			game?.board.pieces.some(
				(p) =>
					p.color === "w" && p.lineToKing.some((sq) => sq.Equals(Pos))
			) && false
		);
	};

	return (
		game && (
			<div className="board-container">
				<Eval game={game} />
				<div className="board">
					{Empty2DBoard.map((row, rowIndex) => (
						<div key={rowIndex} className="row">
							{row.map((_col, colIndex) => {
								const Pos = new Position(rowIndex, colIndex);

								const p = GetPieceAtPosition(
									colIndex + (7 - rowIndex) * 8
								);

								console.log(p);

								const piece = game.board.GetPosition(Pos);

								return (
									<div
										key={colIndex}
										className={`square ${
											DebugSquare(Pos)
												? (rowIndex + colIndex) % 2 ===
												  0
													? "debug-square-light"
													: "debug-square"
												: ""
										} ${
											game.checked &&
											piece?.color === game.currentMove &&
											piece.identifier === "K"
												? "square-checked"
												: ""
										} ${
											(rowIndex + colIndex) % 2 === 0
												? "square-light"
												: "square-dark"
										} ${
											game.selectedPiece?.position.Equals(
												Pos
											) ||
											((game.previousMove?.to.Equals(
												Pos
											) ||
												game.previousMove?.from.Equals(
													Pos
												)) &&
												!game.viewingBoardHistory)
												? "square-selected"
												: ""
										}`}
										onClick={(ev) => {
											ev.preventDefault();
											game.selectSquare(Pos);
										}}
									>
										{p && (
											<img
												className="piece-image"
												src={`/pieces/${p}-${
													p.toUpperCase() === p
														? "w"
														: "b"
												}.svg`}
												alt={`${p}`}
												draggable="false"
											/>
										)}

										{game.highlitedSquares.some((pos) =>
											pos.Equals(Pos)
										) && (
											<div
												className={
													piece ||
													(game.enPassentPossible &&
														game.selectedPiece !==
															undefined &&
														game.selectedPiece instanceof
															Pawn &&
														game.selectedPiece.canEP(
															Pos
														))
														? "capture-highlight"
														: "highlight"
												}
											></div>
										)}

										{colIndex === 0 && (
											<span className="row-num">
												{Rows[rowIndex]}
											</span>
										)}

										{rowIndex === 7 && (
											<span className="col-num">
												{Columns[colIndex]}
											</span>
										)}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>
		)
	);
}

export default Board;
