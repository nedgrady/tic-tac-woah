import { AiParticipant } from "aiAgents/AiParticipant"
import { AiParticipantFactory } from "aiAgents/AiParticipantFactory"

export class RandomlyMovingAiParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		const id = crypto.randomUUID()
		return {
			id: crypto.randomUUID(),
			nextMove: () => {
				return {
					placement: {
						x: Math.floor(Math.min(Math.random() * 20)),
						y: Math.floor(Math.min(Math.random() * 20)),
					},
					mover: id,
				}
			},
		}
	}
}
