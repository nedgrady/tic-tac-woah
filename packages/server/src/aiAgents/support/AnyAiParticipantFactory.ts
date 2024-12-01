import { AiParticipant } from "../.."
import { aiParticipantFactory } from "../../testingUtilities/factories"
import { AiParticipantFactory } from "../AiParticipantFactory"

export class AnyAiParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		return aiParticipantFactory.build()
	}
}
