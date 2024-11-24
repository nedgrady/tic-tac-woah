import { GenerativeModel, SchemaType } from "@google/generative-ai"
import { AiParticipant } from "aiAgents/AiParticipant"
import { Game } from "domain/Game"
import { Move } from "domain/Move"
import { Participant } from "domain/Participant"
import { z } from "zod"
import retry from "async-retry"
export const AiModelMoveResponseSchema = z.object({
	x: z.number().int(),
	y: z.number().int(),
})

const tokensModelUsedDuringTraining = ["🟥", "🟦", "🟧", "🟨", "🟩", "🟪", "🟫"]

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

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		const tokensForParticipants = new Map<string, string>(
			game.participants.map((mover, index) => {
				return [mover, tokensModelUsedDuringTraining[index]]
			}),
		)

		const allMoves = game
			?.moves()
			.map(m => `(${m.placement.x}, ${m.placement.y})`)
			.join(",")

		const text = `
		You are playing extended tic tac toe
		==================================================================
		This is very important:
		Do not respond with any of the following coordinates: ${allMoves}
		==================================================================
		Consider blocking your opponent's strong moves
		Board size: ${game.boardSize}
		${[...tokensForParticipants.values()]}
		${JSON.stringify(game.moves().map(m => ({ position: m.placement, player: tokensForParticipants.get(m.mover) })))}
		You are ${tokensForParticipants.get(participant)}

		One in 2 times respond with a random legal move.
		`

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
			generationConfig: {
				temperature: 2.0,
				topK: 40,
				topP: 0.9,
			},
		})

		const coordinateResponse = modelResponse.response.text().match(/^\d+|\d+\b|\d+(?=\w)/g)

		console.log("GeminiAiAgent.nextMove coordinateResponse", coordinateResponse)

		const response = AiModelMoveResponseSchema.parse({
			x: parseInt(coordinateResponse![0]),
			y: parseInt(coordinateResponse![1]),
		})

		console.log("GeminiAiAgent.nextMove", response)

		return { mover: participant, placement: response } as Move
	}
}

export class RetryingAiAgent<TAgent extends AiParticipant> extends AiParticipant {
	readonly id: string = crypto.randomUUID()
	constructor(private readonly agent: TAgent) {
		super()
	}

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		return await retry(
			async () => {
				const move = await this.agent.nextMove(game, participant)

				// TODO - should game return a success/failure for move instead of void?
				const moveAlreadyMade = game
					.moves()
					.some(
						existingMove =>
							existingMove.placement.x === move.placement.x &&
							existingMove.placement.y === move.placement.y,
					)

				if (moveAlreadyMade) {
					throw new Error("Move already made")
				}
				return move
			},
			{
				retries: 5,
				maxRetryTime: 30000,
				factor: 1,
			},
		)
	}
}
