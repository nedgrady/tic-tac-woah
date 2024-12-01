import { faker } from "@faker-js/faker"
import { Game } from "./Game"
import { Move } from "./Move"
import { Participant } from "./Participant"

export type PlacementSpecification = (Participant | Empty)[][]
export type Empty = ""

export function createMoves(placementDefinitions: PlacementSpecification): readonly Move[] {
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

export function makeMoves(game: Game, placementDefinitions: PlacementSpecification) {
	for (const suppliedMove of createMoves(placementDefinitions)) game.submitMove(suppliedMove)
}

export function createParticipants(count: number): readonly Participant[] {
	return Array.from({ length: count }).map(() => faker.string.alphanumeric(8))
}
