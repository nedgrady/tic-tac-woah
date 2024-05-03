import { CreateGameOptions, Game } from "domain/Game"
import { Participant } from "domain/Participant"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { GameFactory } from "../GameFactory"

export class ReturnSequenceOfGamesFactory extends GameFactory {
	private gameOptionsIterator: Iterator<Partial<CreateGameOptions>>

	constructor(...gameOptions: readonly Partial<CreateGameOptions>[]) {
		super()

		this.gameOptionsIterator = gameOptions[Symbol.iterator]()
	}

	createGame(participants: readonly Participant[]): Game {
		const { value: currentOptions, done } = this.gameOptionsIterator.next()

		if (done) throw new Error("No more games to return")

		const gameOptions: CreateGameOptions = {
			participants: participants,
			rules: [anyMoveIsAllowed],
			winConditions: [],
			endConditions: [],
			decideWhoMayMoveNext: anyParticipantMayMoveNext,
			...currentOptions,
		}
		const game = new Game(gameOptions)
		return game
	}
}
