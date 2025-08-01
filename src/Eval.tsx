import "./Eval.css";
import { Game } from "./lib/Game/Game";

interface Props {
	game: Game;
}

function Eval({ game }: Props) {
	return (
		<div className="eval-bar">
			<span
				className="eval-white"
				style={{
					height: `${Math.max(
						0,
						Math.min(
							Math.log10(Math.abs(Number(game.eval) || 0) + 1) *
								25 *
								Math.sign(Number(game.eval) || 0) +
								50,
							100
						)
					)}%`,
				}}
			></span>
			<span className="eval-value">
				{game.mate ? `M${game.mate}` : game.eval}
			</span>
		</div>
	);
}

export default Eval;
