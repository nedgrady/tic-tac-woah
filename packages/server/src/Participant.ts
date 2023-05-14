import Coordinates from "./Coordinates"
import { Game } from "./Game"

export class Participant {
	game: Game
	makeMove(coordinates: Coordinates) {
		this.game.submitMove({
			mover: this,
			placement: coordinates,
		})
	}
}
