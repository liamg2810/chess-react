import { useEffect, useState } from "react";
import "./GameInfo.css";
import { Game } from "./lib/Game";

interface Props {
	game: Game;
	render: number;
}

function GameInfo({ game, render }: Props) {
	const [fen, setFen] = useState("");

	useEffect(() => {
		setFen(game.fen || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [render]);

	return (
		<div className="gameinfo">
			<div className="fen-container">
				FEN:
				<div className="fen">
					<input
						onChange={(e) => setFen(e.target.value)}
						className="fen-input"
						value={fen}
					></input>
					<button
						className="fen-load"
						onClick={() => {
							game.loadFen(fen);
						}}
					>
						Load
					</button>
				</div>
			</div>
		</div>
	);
}

export default GameInfo;
