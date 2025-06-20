import "./Board.css";
import Eval from "./Eval";
import { Columns, Game, Rows } from "./lib/Game";
import { arraysEqual, posInArray } from "./lib/utils";

interface Props {
	game: Game | undefined;
}

function Board({ game }: Props) {
	return (
		game && (
			<div className="board-container">
				<Eval game={game} />
				<div className="board">
					{game.board.map((row, rowIndex) => (
						<div key={rowIndex} className="row">
							{row.map((piece, colIndex) => (
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
										(game.selectedPiece?.position[0] ===
											rowIndex &&
											game.selectedPiece?.position[1] ===
												colIndex) ||
										posInArray(game.previousMove, [
											rowIndex,
											colIndex,
										])
											? "square-selected"
											: ""
									}`}
									onClick={(ev) => {
										ev.preventDefault();
										game.selectSquare([rowIndex, colIndex]);
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

									{game.highlitedSquares.some(
										([r, c]) =>
											r === rowIndex && c === colIndex
									) && (
										<div
											className={
												piece ||
												(arraysEqual(
													game.enPassentPossible ||
														[],
													[rowIndex, colIndex]
												) &&
													game.selectedPiece
														?.identifier === "P")
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
							))}
						</div>
					))}
				</div>
			</div>
		)
	);
}

export default Board;
