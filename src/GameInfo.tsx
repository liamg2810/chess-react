import { ChangeEvent, useEffect, useState } from "react";
import "./GameInfo.css";
import { Game } from "./lib/Game/Game";
import { RunPerfTests } from "./lib/Game/utils/PerfTests";

interface Props {
	game: Game;
	render: number;
}

function GameInfo({ game, render }: Props) {
	const [fen, setFen] = useState("");
	const [stockfishEnabled, setStockfishEnabled] = useState(true);
	const [stockfishDepth, setStockfishDepth] = useState(6);
	const [ply, setPly] = useState(3);

	useEffect(() => {
		setFen(game.board.fen || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [render]);

	const toggleStockfish = () => {
		setStockfishEnabled((prev) => {
			game.stockfishEnabled = !prev;
			return !prev;
		});
	};

	const changeStockfishDepth = (ev: ChangeEvent<HTMLInputElement>) => {
		setStockfishDepth(parseInt(ev.target.value));
		game.stockfishDepth = parseInt(ev.target.value);
	};

	return (
		<div className="gameinfo">
			<div className="stockfish">
				<div className="stockfish-toggle">
					<button onClick={() => RunPerfTests(ply, game)}>
						Run perf tests
					</button>
					<label htmlFor="ply">perft ply</label>
					<input
						type="number"
						id="ply"
						min={1}
						max={6}
						value={ply}
						onChange={(e) => setPly(parseInt(e.target.value))}
					/>
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
				</div>

				<div className="stockfish-depth">
					<span>Stockfish Depth</span>
					<input
						className="stockfish-depth-input"
						type="number"
						name="stockfish-depth"
						min={1}
						max={16}
						value={stockfishDepth}
						onChange={changeStockfishDepth}
					/>
				</div>
			</div>
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
									game.LoadBoardHistory(index, halfIndex);
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
							game.Restart(fen);
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
