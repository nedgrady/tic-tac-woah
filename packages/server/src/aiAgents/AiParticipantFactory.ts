import { AiParticipant } from "./AiParticipant"

export abstract class AiParticipantFactory {
	abstract createAiAgent(): AiParticipant
}
