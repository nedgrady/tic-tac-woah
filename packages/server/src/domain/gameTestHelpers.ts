import { Move } from "../Move"
import { Participant } from "../Participant"
import { GameWinCondition } from "./winConditions/winConditions"

export type PlacementSpecification = (Participant | Empty)[][]
export type Empty = ""

export interface GameWinTestCase {
	readonly board: PlacementSpecification
	readonly consecutiveTarget: number
	readonly winningMove: Move
	readonly expectedWinningMoves: readonly Move[]
	readonly gameWinConditionUnderTest: GameWinCondition
	readonly participants: readonly Participant[]
}

export type GameContinuesTestCase = Omit<GameWinTestCase, "winningMove" | "expectedWinningMoves">

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

export function makeMoves(placementDefinitions: PlacementSpecification) {
	for (const move of createMoves(placementDefinitions)) move.mover.makeMove(move.placement)
}

export function createParticipants(count: number): readonly Participant[] {
	return Array.from({ length: count }).map(() => new Participant())
}
