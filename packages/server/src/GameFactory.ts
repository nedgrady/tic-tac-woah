import { CreateGameOptions, Game } from "domain/Game"
import { Participant } from "domain/Participant"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"

export abstract class GameFactory {
	abstract createGame(participants: readonly Participant[]): Game
}

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

export class AnythingGoesForeverGameFactory extends GameFactory {
	createGame(participants: readonly Participant[]): Game {
		const gameOptions: CreateGameOptions = {
			participants: participants,
			rules: [anyMoveIsAllowed],
			winConditions: [],
			endConditions: [],
			decideWhoMayMoveNext: anyParticipantMayMoveNext,
		}
		return new Game(gameOptions)
	}
}
