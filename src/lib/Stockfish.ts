export async function GetMove(
	fen: string,
	depth: number = 6
): Promise<{
	eval: number;
	fromNumeric: string;
	toNumeric: string;
	mate: number | null;
}> {
	console.log(fen, depth);

	const response = await fetch("https://chess-api.com/v1", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ fen: fen, depth: depth }),
	});

	return await response.json();
}
