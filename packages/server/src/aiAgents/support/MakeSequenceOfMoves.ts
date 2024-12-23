import Coordinates from "../../domain/Coordinates"
import { Move } from "../../domain/Move"
import { ThrowingIterator } from "../../testingUtilities/ThrowingIterator"

import { AiParticipant } from "../AiParticipant"

export class MakeSequenceOfMoves implements AiParticipant {
	private readonly coordinatesIterator: ThrowingIterator<Coordinates>
	name: string = "MakeSequenceOfMoves"

	constructor(
		coordinates: readonly Coordinates[],
		public readonly id: string,
	) {
		this.coordinatesIterator = new ThrowingIterator(coordinates, "Coordinates")
	}

	async nextMove(): Promise<Move> {
		return {
			placement: this.coordinatesIterator.next(),
			// well maybe AiParticipant should only return a placement, since clients calling nextMove already have access to its id
			mover: "TODO",
		}
	}
}
