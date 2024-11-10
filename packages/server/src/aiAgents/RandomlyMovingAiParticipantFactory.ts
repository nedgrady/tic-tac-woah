import { AiParticipant } from "aiAgents/AiParticipant"
import { AiParticipantFactory } from "aiAgents/AiParticipantFactory"
import { Move } from "domain/Move"

export class RandomlyMovingAiParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		const id = crypto.randomUUID()
		return {
			id: crypto.randomUUID(),
			nextMove: () => {
				return Promise.resolve({
					placement: {
						x: Math.floor(Math.min(Math.random() * 20)),
						y: Math.floor(Math.min(Math.random() * 20)),
					},
					mover: id,
				})
			},
		}
	}
}

class RandomlyMovingAiParticipant extends AiParticipant {
	async nextMove(): Promise<Move> {
		return {
			placement: {
				x: Math.floor(Math.min(Math.random() * 20)),
				y: Math.floor(Math.min(Math.random() * 20)),
			},
			mover: this.id,
		}
	}
}