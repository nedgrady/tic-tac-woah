import { AiParticipant } from ".."
import { Move } from "../domain/Move"
import { AiParticipantFactory } from "./AiParticipantFactory"

export class RandomlyMovingAiParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		const id = crypto.randomUUID()
		return {
			id: crypto.randomUUID(),
			name: "RandomlyMovingAiParticipant",
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

// class RandomlyMovingAiParticipant extends AiParticipant {
// 	readonly id = crypto.randomUUID()
// 	readonly name = "RandomlyMovingAiParticipant"
// 	async nextMove(): Promise<Move> {
// 		return {
// 			placement: {
// 				x: Math.floor(Math.min(Math.random() * 20)),
// 				y: Math.floor(Math.min(Math.random() * 20)),
// 			},
// 			mover: this.id,
// 		}
// 	}
// }
