import { AiParticipant } from ".."

export abstract class AiParticipantFactory {
	abstract createAiAgent(): AiParticipant
}
