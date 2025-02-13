import { useEffect, useState } from "react";
import "./App.css";
import { Game } from "./lib/Game";

function App() {
	const [, setRender] = useState(0);

	const [game, setGame] = useState<Game>();

	useEffect(() => {
		setGame(
			new Game(() => {
				setRender((prev) => prev + 1);
			})
		);
	}, []);

	return (
		game && (
			<div>
				{game.board.map((row, rowIndex) => (
					<div key={rowIndex} style={{ display: "flex" }}>
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
									game.selectedPiece?.position[0] ===
										rowIndex &&
									game.selectedPiece?.position[1] === colIndex
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
									/>
								)}

								{game.highlitedSquares.some(
									([r, c]) => r === rowIndex && c === colIndex
								) && (
									<div
										className={
											piece
												? "capture-highlight"
												: "highlight"
										}
									></div>
								)}
							</div>
						))}
					</div>
				))}
			</div>
		)
	);
}

export default App;
