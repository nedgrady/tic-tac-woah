import { GenerativeModel } from "@google/generative-ai"
import { AiParticipant } from "aiAgents/AiParticipant"
import { Move } from "domain/Move"
import { z } from "zod"

export const AiModelMoveResponseSchema = z.object({
	x: z.number(),
	y: z.number(),
})

export class GeminiAiAgent extends AiParticipant {
	constructor(private readonly model: Readonly<GenerativeModel>) {
		super()
	}

	async nextMove(): Promise<Move> {
		const modelResponse = await this.model.generateContent({
			contents: [],
		})
		const move = AiModelMoveResponseSchema.parse(JSON.parse(modelResponse.response.text()))
		return { mover: "TODO", placement: move } as Move
	}
}
