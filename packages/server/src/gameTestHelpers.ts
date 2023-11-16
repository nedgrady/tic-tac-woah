import { Move } from "./Move"
import { Participant } from "./Participant"

export type PlacementSpecification = (Participant | Empty)[][]
export type Empty = ""

export function createMoves(placementDefinitions: PlacementSpecification) {
	const moves: Move[] = []

	placementDefinitions.forEach((row, rowIndex) => {
		row.forEach((participant, columnIndex) => {
			if (participant === "") return

			moves.push({
				mover: participant,
				placement: { x: columnIndex, y: rowIndex },
			})
		})
	})

	return moves
}

export function makeMoves(placementDefinitions: PlacementSpecification) {
	for (const move of createMoves(placementDefinitions)) move.mover.makeMove(move.placement)
}
