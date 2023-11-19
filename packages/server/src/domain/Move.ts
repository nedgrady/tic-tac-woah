import Coordinates from "./Coordinates"
import { Participant } from "./Participant"

export interface Move {
	placement: Coordinates
	mover: Participant
}
