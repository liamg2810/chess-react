import "./GameInfo.css";
import { Game } from "./lib/Game";

interface Props {
	game: Game | undefined;
}

function GameInfo({ game }: Props) {
	return (
		<div className="gameinfo">
			<div className="fen-container">
				FEN:
				<span className="fen">{game?.fen}</span>
			</div>
		</div>
	);
}

export default GameInfo;
