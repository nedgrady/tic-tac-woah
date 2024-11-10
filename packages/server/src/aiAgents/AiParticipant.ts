import { Move } from "domain/Move"

// TODO - move to domain folder?
export abstract class AiParticipant {
	readonly id: string = crypto.randomUUID()
	abstract nextMove(): Promise<Move>
}
