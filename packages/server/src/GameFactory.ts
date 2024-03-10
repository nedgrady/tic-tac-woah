import { Game } from "domain/Game"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"

export abstract class GameFactory {
	abstract createGame(): Game
}

export class ReturnSingleGameFactory extends GameFactory {
	private game: Game

	constructor(game: Game) {
		super()
		this.game = game
	}

	createGame(): Game {
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

	createGame(): Game {
		if (this.currentIndex > this.games.length) throw new Error("No more games to return")
		const game = this.games[this.currentIndex++]
		return game
	}
}

export class AnythingGoesForeverGameFactory extends GameFactory {
	createGame(): Game {
		return new Game([], 10, 10, [anyMoveIsAllowed], [])
	}
}
