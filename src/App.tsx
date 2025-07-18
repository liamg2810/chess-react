import { useEffect, useState } from "react";
import "./App.css";
import Board from "./Board";
import GameInfo from "./GameInfo";
import GameOver from "./GameOver";
import { Game } from "./lib/Game/Game";

function App() {
	const [render, setRender] = useState(0);

	const [game, setGame] = useState<Game>();

	useEffect(() => {
		setGame(
			new Game(() => {
				setRender((prev) => prev + 1);
			})
		);
	}, []);

	return (
		<>
			{game && (
				<>
					<div className="game">
						<Board game={game} />
						<GameInfo game={game} render={render} />
					</div>
					{game.gameOver && <GameOver game={game} />}
				</>
			)}
		</>
	);
}

export default App;
