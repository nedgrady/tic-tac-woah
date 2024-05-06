import { CreateGameOptions, Game } from "domain/Game"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { GameFactory } from "../GameFactory"
import { MadeMatch } from "matchmaking/MatchmakingStrategy"

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
