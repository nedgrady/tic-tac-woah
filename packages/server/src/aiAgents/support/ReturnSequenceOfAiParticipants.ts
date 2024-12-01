import { ThrowingIterator } from "../../testingUtilities/ThrowingIterator"
import { AiParticipant } from "../AiParticipant"
import { AiParticipantFactory } from "../AiParticipantFactory"

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
