import { useEffect, useState } from "react";
import "./GameInfo.css";
import { Game } from "./lib/Game";

interface Props {
	game: Game;
	render: number;
}

function GameInfo({ game, render }: Props) {
	const [fen, setFen] = useState("");
	// const [stockfishEnabled, setStockfishEnabled] = useState(true);

	useEffect(() => {
		setFen(game.fen || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [render]);

	// const toggleStockfish = () => {
	// 	setStockfishEnabled((prev) => !prev);
	// };

	return (
		<div className="gameinfo">
			{/* <div className="stockfish">
				<span>Stockfish to play black</span>
				<div
					className={`stockfish-switch ${
						stockfishEnabled
							? "stockfish-switch-on"
							: "stockfish-switch-off"
					}`}
					onClick={toggleStockfish}
				>
					<div className="stockfish-switch-circle">
						{stockfishEnabled ? "I" : "O"}
					</div>
				</div>
			</div> */}
			<div className="moves-container">
				{game.moves.map((moveSet, index) => (
					<div
						className={`move-row ${
							index % 2 === 0 ? "row-dark" : "row-light"
						}`}
						key={index}
					>
						<span className="move-number">{index + 1}.</span>
						{moveSet.map((element, halfIndex) => (
							<div
								className="move"
								key={`${halfIndex}${element}`}
								onClick={() => {
									game.loadBoardHistory(index, halfIndex);
								}}
							>
								{element}
							</div>
						))}
					</div>
				))}
			</div>
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
							game.restart(fen);
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
