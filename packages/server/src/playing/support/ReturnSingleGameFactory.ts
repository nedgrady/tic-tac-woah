import { CreateGameOptions, Game } from "domain/Game"
import { Participant } from "domain/Participant"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { GameFactory } from "../GameFactory"

export class ReturnSingleGameFactory extends GameFactory {
	constructor(private readonly gameOptions: Partial<CreateGameOptions> = {}) {
		super()
	}

	createGame(participants: readonly Participant[]): Game {
		const gameOptions: CreateGameOptions = {
			participants: participants,
			rules: [anyMoveIsAllowed],
			winConditions: [],
			endConditions: [],
			decideWhoMayMoveNext: anyParticipantMayMoveNext,
			...this.gameOptions,
		}

		return new Game(gameOptions)
	}
}
