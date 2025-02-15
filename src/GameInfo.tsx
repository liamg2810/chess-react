import { Game } from "./lib/Game";

interface Props {
	game: Game | undefined;
}

function GameInfo({ game }: Props) {
	return <div>{game?.fen}</div>;
}

export default GameInfo;
