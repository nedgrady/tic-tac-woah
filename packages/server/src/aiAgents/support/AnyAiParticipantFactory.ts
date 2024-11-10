import { AiParticipant } from "aiAgents/AiParticipant"
import { AiParticipantFactory } from "aiAgents/AiParticipantFactory"
import { aiParticipantFactory } from "testingUtilities/factories"

export class AnyAiParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		return aiParticipantFactory.build()
	}
}
