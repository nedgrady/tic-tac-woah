import { AiParticipant } from "aiAgents/AiParticipant"
import { AiParticipantFactory } from "aiAgents/AiParticipantFactory"
import { ThrowingIterator } from "matchmaking/Matchmaking.test"

export class ReturnSequenceOfAiParticipants extends AiParticipantFactory {
	private gameOptionsIterator: ThrowingIterator<AiParticipant>

	constructor(aiParticipants: AiParticipant[]) {
		super()
		this.gameOptionsIterator = new ThrowingIterator(aiParticipants, "AiParticipant")
	}

	createAiAgent(): AiParticipant {
		return this.gameOptionsIterator.next()
	}
}
