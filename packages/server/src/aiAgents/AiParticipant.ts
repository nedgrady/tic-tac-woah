import { Move } from "domain/Move"

export abstract class AiParticipant {
	abstract get id(): string
	abstract nextMove(): Move
}
