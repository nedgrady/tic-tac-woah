import Coordinates from "./Coordinates"
import { Game } from "./Game"

export class Participant {
	game: Game | null

	constructor() {
		this.game = null
	}

	makeMove(coordinates: Coordinates) {
		this.game?.submitMove({
			mover: this,
			placement: coordinates,
		})
	}
}
