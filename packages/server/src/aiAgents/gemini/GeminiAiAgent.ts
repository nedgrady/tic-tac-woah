import { GenerativeModel, SchemaType } from "@google/generative-ai"
import { AiParticipant } from "aiAgents/AiParticipant"
import { Game } from "domain/Game"
import { Move } from "domain/Move"
import { Participant } from "domain/Participant"
import { z } from "zod"

export const AiModelMoveResponseSchema = z.object({
	x: z.number().int(),
	y: z.number().int(),
})

const geminiMoveResponseSchema = {
	description: "AiModelMoveResponseSchema",
	type: SchemaType.OBJECT,
	properties: {
		x: {
			type: SchemaType.NUMBER,
		},
		y: {
			type: SchemaType.NUMBER,
		},
	},
}

function generateBoardText(game: Game): string {
	// Initialize a 3x3 board with empty strings
	const board: string[][] = [
		["", "", ""],
		["", "", ""],
		["", "", ""],
	]

	// Populate the board with moves
	game.moves().forEach(move => {
		const { x, y } = move.placement
		board[y][x] = move.mover
	})

	// Generate the text representation of the board
	return board.map(row => row.map(cell => (cell === "" ? "." : cell)).join(" ")).join("\n")
}

export class GeminiAiAgent extends AiParticipant {
	// TODO - why does this appear to get dropped by intellisence cross module boundaries??
	readonly id: string = crypto.randomUUID()
	constructor(private readonly model: Readonly<GenerativeModel>) {
		super()
	}

	async nextMove(game?: Game, participant?: Participant): Promise<Move> {
		const moves = game?.moves()
		const ourRow = game?.moves().find(m => m.mover === participant)?.placement.y

		const boardText = generateBoardText(game!)
		const ourMoves = game
			?.moves()
			.filter(m => m.mover === participant)
			.map(m => `(${m.placement.x}, ${m.placement.y})`)
			.join(",")

		const theirMoves = game
			?.moves()
			.filter(m => m.mover !== participant)
			.map(m => `(${m.placement.x}, ${m.placement.y})`)
			.join(",")

		const text = `
		Respond only with integers.
		Given this set of coordinates ${ourMoves}.
		Find the next coordinate that will create a run of 3 adjacent coordinates.
		You may not use any of these coordinates either (which also do not count for runs of 3): ${theirMoves}.
		Don't forget to look 'inside' runs, e.g. X . X can be a run of 3 if we pick the middle square.
		Coordinates can be adjacent horizontally, vertically, or diagonally.
		`

		// if (
		// 	moves?.find(m => m.placement.x === 0 && m.placement.y === 1 && m.mover === participant) &&
		// 	moves?.find(m => m.placement.x === 0 && m.placement.y === 0 && m.mover === participant)
		// ) {
		// 	text = `Respond only with integers. Response with x: 0, y: 2`
		// }

		console.log("GeminiAiAgent.nextMove", text)

		const modelResponse = await this.model.generateContent({
			contents: [
				{
					role: "user",
					parts: [
						{
							text,
						},
					],
				},
			],
			generationConfig: { responseMimeType: "application/json", responseSchema: geminiMoveResponseSchema },
		})
		const move = AiModelMoveResponseSchema.parse(JSON.parse(modelResponse.response.text()))
		return { mover: participant, placement: move } as Move
	}
}
