import { Game } from "domain/Game"
import { MadeMatch } from "matchmaking/MatchmakingStrategy"

export abstract class GameFactory {
	abstract createGame(madeMatch: MadeMatch): Game
}
