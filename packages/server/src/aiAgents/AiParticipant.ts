import { Game } from "domain/Game"
import { Move } from "domain/Move"
import { Participant } from "domain/Participant"

// TODO - move to domain folder?
export abstract class AiParticipant {
	readonly id: string = crypto.randomUUID()
	abstract nextMove(game: Game, participant: Participant): Promise<Move>
}
