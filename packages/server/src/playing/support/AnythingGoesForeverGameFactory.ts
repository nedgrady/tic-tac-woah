import { Game, CreateGameOptions } from "../../domain/Game"
import { anyMoveIsAllowed } from "../../domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "../../domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { MadeMatch } from "../../matchmaking/MatchmakingStrategy"
import { GameFactory } from "../GameFactory"

export class AnythingGoesForeverGameFactory extends GameFactory {
	createGame(madeMatch: MadeMatch): Game {
		const gameOptions: CreateGameOptions = {
			participants: madeMatch.participants.map(participant => participant.uniqueIdentifier),
			rules: [anyMoveIsAllowed],
			winConditions: [],
			endConditions: [],
			decideWhoMayMoveNext: anyParticipantMayMoveNext,
		}
		return new Game(gameOptions)
	}
}
