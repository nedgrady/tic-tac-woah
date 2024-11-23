import { GenerativeModel, SchemaType } from "@google/generative-ai"
import { AiParticipant } from "aiAgents/AiParticipant"
import { Game } from "domain/Game"
import { Move } from "domain/Move"
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

export class GeminiAiAgent extends AiParticipant {
	// TODO - why does this appear to get dropped by intellisence cross module boundaries??
	readonly id: string = crypto.randomUUID()
	constructor(private readonly model: Readonly<GenerativeModel>) {
		super()
	}

	async nextMove(game?: Game): Promise<Move> {
		const ourRow = game?.moves().find(m => m.mover === this.id)?.placement.y

		const text = `Respond only with integers. Response with x: 2, y: ${ourRow}`
		console.log("text", text)

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
		return { mover: "TODO", placement: move } as Move
	}
}
