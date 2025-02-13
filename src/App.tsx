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
								style={{
									width: "100px",
									position: "relative",
									height: "100px",
									border: "1px solid black",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backgroundColor: (() => {
										return (rowIndex + colIndex) % 2 === 0
											? "orange"
											: "red";
									})(),
									color: "black",
								}}
								onClick={(ev) => {
									ev.preventDefault();
									game.selectSquare([rowIndex, colIndex]);
									console.log(game.highlitedSquares);
									console.log([rowIndex, colIndex]);
								}}
							>
								<span
									style={{
										zIndex: 10,
										fontSize: "3rem",
										color:
											piece?.color === "w"
												? "white"
												: "black",
									}}
								>
									{piece ? piece.identifier : ""}
								</span>

								{game.highlitedSquares.some(
									([r, c]) => r === rowIndex && c === colIndex
								) && (
									<div
										style={{
											position: "absolute",
											backgroundColor: "green",
											opacity: 0.4,
											width: "100%",
											height: "100%",
										}}
									></div>
								)}

								{game.selectedPiece?.position[0] === rowIndex &&
									game.selectedPiece?.position[1] ===
										colIndex && (
										<div
											style={{
												backgroundColor: "blue",
												position: "absolute",
												opacity: 0.4,
												width: "100%",
												height: "100%",
											}}
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
