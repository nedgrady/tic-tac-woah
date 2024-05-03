import { Game } from "domain/Game"
import { Participant } from "domain/Participant"

export abstract class GameFactory {
	abstract createGame(participants: readonly Participant[]): Game
}
