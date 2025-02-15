import { useEffect, useState } from "react";
import "./App.css";
import Board from "./board";
import GameInfo from "./GameInfo";
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
		<div className="game">
			<Board game={game} />
			<GameInfo game={game} />
		</div>
	);
}

export default App;
