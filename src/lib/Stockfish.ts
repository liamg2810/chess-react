const wasmSupported =
	typeof WebAssembly === "object" &&
	WebAssembly.validate(
		Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
	);

const stockfish = new Worker(
	wasmSupported ? "/stockfish/stockfish.wasm.js" : "/stockfish/stockfish.js"
);

export async function GetMove(
	fen: string,
	depth: number
): Promise<{ bestmove: string; eval: number | string }> {
	return new Promise((resolve) => {
		let bestmove = "";
		let evaluation: number | string = 0;
		const onMessage = (event: MessageEvent) => {
			const line = typeof event.data === "string" ? event.data : "";
			if (line.startsWith("bestmove")) {
				bestmove = line.split(" ")[1];
				stockfish.removeEventListener("message", onMessage);
				resolve({ bestmove, eval: evaluation });
			} else if (line.startsWith("info depth")) {
				const match = line.match(/score (cp|mate) ([-0-9]+)/);
				if (match) {
					if (match[1] === "cp") {
						evaluation = parseInt(match[2], 10) / 100;
					} else if (match[1] === "mate") {
						evaluation = `#${match[2]}`;
					}
				}
			}
		};
		stockfish.addEventListener("message", onMessage);
		stockfish.postMessage("ucinewgame");
		stockfish.postMessage(`position fen ${fen}`);
		stockfish.postMessage(`go depth ${depth}`);
	});
}
