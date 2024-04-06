import { Game } from "domain/Game"
import { Participant } from "domain/Participant"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"

export abstract class GameFactory {
	abstract createGame(participants: Participant[]): Game
}

export class ReturnSingleGameFactory extends GameFactory {
	private game: Game

	constructor(game: Game) {
		super()
		this.game = game
	}

	createGame(_: Participant[]): Game {
		return this.game
	}
}

export class ReturnSequenceOfGamesFactory extends GameFactory {
	private games: Game[]
	private currentIndex = 0

	constructor(...games: Game[]) {
		super()
		this.games = games
	}

	createGame(_: Participant[]): Game {
		if (this.currentIndex > this.games.length) throw new Error("No more games to return")
		const game = this.games[this.currentIndex++]
		return game
	}
}

export class AnythingGoesForeverGameFactory extends GameFactory {
	createGame(_: Participant[]): Game {
		return new Game([], 10, 10, [anyMoveIsAllowed], [], [], anyParticipantMayMoveNext)
	}
}
