import "./Board.css";
import Eval from "./Eval";
import { Game } from "./lib/Game/Game";
import { Position } from "./lib/Game/Position";
import { posInArray } from "./lib/utils";

interface Props {
	game: Game | undefined;
}

function Board({ game }: Props) {
	const Empty2DBoard: null[][] = Array.from({ length: 8 }, () =>
		Array(8).fill(null)
	);

	const Rows = ["8", "7", "6", "5", "4", "3", "2", "1"];
	const Columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

	return (
		game && (
			<div className="board-container">
				<Eval game={game} />
				<div className="board">
					{Empty2DBoard.map((row, rowIndex) => (
						<div key={rowIndex} className="row">
							{row.map((_col, colIndex) => {
								const Pos = new Position(rowIndex, colIndex);

								const piece = game.board.GetPosition(Pos);

								return (
									<div
										key={colIndex}
										className={`square ${
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
											posInArray(
												game.previousMove,
												new Position(rowIndex, colIndex)
											)
												? "square-selected"
												: ""
										}`}
										onClick={(ev) => {
											ev.preventDefault();
											game.selectSquare(Pos);
										}}
									>
										{piece && (
											<img
												className="piece-image"
												src={`/pieces/${piece.identifier}-${piece?.color}.svg`}
												alt={`${piece.identifier}`}
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
														game.enPassentPossible.Equals(
															Pos
														) &&
														game.selectedPiece
															?.identifier ===
															"P")
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
