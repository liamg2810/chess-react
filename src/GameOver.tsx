import "./Board.css";
import "./GameOver.css";
import { Game } from "./lib/Game/Game";

interface Props {
	game: Game;
}

function GameOver({ game }: Props) {
	return (
		<div className="gameover-screen">
			<div className="gameover-card">
				<span className="gameover-reason">
					{game.checkmate
						? "Checkmate " +
						  (game.currentMove === "b"
								? "white wins"
								: "black wins")
						: "Draw by "}
					{game.draw ? game.drawReason : ""}
				</span>

				<button
					className="gameover-restart"
					onClick={(e) => {
						e.preventDefault();
						game.Restart();
					}}
				>
					Restart
				</button>
			</div>
		</div>
	);
}

export default GameOver;
