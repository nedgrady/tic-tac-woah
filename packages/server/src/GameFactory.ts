import { Game } from "domain/Game"

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
