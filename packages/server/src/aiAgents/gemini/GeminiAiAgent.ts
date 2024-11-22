import { GenerativeModel, SchemaType } from "@google/generative-ai"
import { AiParticipant } from "aiAgents/AiParticipant"
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
	constructor(private readonly model: Readonly<GenerativeModel>) {
		super()
	}

	async nextMove(): Promise<Move> {
		const modelResponse = await this.model.generateContent({
			contents: [
				{
					role: "user",
					parts: [
						{
							text: "Respond only with integers",
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
