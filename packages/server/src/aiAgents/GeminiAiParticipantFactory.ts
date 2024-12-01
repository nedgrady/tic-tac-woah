import { GenerativeModel } from "@google/generative-ai"
import { AiParticipantFactory } from "./AiParticipantFactory"
import { AiParticipant, GeminiAiAgent, RetryingAiAgent } from ".."

const model = new GenerativeModel(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY, {
	model: "tunedModels/tictacwoahhumandata1-r59fet8nx4cw",
})

export class GeminiAiParticipantFactory extends AiParticipantFactory {
	constructor() {
		super()
	}

	createAiAgent(): AiParticipant {
		return new RetryingAiAgent(new GeminiAiAgent(model))
	}
}
