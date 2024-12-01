import { Coordinates } from ".."
import { Participant } from "./Participant"

export interface Move {
	placement: Coordinates
	mover: Participant
}
