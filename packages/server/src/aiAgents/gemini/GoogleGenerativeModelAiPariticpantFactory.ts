import { GenerativeModel } from "@google/generative-ai"
import { AiParticipantFactory } from "aiAgents/AiParticipantFactory"
import { Move } from "domain/Move"
import { z } from "zod"

export const AiModelMoveResponseSchema = z.object({
	x: z.number(),
	y: z.number(),
})

export type AiModelMoveResponse = z.infer<typeof AiModelMoveResponseSchema>

export class GoogleGenerativeModelAiPariticpantFactory extends AiParticipantFactory {
	constructor(private model: GenerativeModel) {
		super()
	}

	createAiAgent() {
		return {
			nextMove: async () => {
				const modelResponse = await this.model.generateContent({
					contents: [],
				})
				const move = AiModelMoveResponseSchema.parse(JSON.parse(modelResponse.response.text()))
				return { mover: "TODO", placement: move } as Move
			},
			id: "TODO",
		}
	}
}
