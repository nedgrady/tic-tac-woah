import _ from "lodash"
import { Move } from "./Move"
import { GameConfiguration, GameState } from "./gameRules"

export type GameWinCondition = (newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) => boolean

export const winByConsecutiveVerticalPlacements: GameWinCondition = (
	newMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => {
	const placementsByCurrentPlayer = gameState.moves
		.filter(move => move.mover === newMove.mover)
		.sort((move1, move2) => move1.placement.y - move2.placement.y)
		.map(move => move.placement)

	if (placementsByCurrentPlayer.length < gameConfiguration.consecutiveTarget) return false

	const allXs = placementsByCurrentPlayer.map(placement => placement.x)

	for (const xCoordinate of allXs) {
		const currentColumn = placementsByCurrentPlayer.filter(placement => placement.x === xCoordinate)
		if (currentColumn.length < gameConfiguration.consecutiveTarget) continue
		for (let placementsChunk of overlappingChunks(currentColumn, gameConfiguration.consecutiveTarget)) {
			if (
				placementsChunk[placementsChunk.length - 1].y - placementsChunk[0].y ===
				gameConfiguration.consecutiveTarget - 1
			) {
				return true
			}
		}
	}

	return false
}

/**
 * 

		makeMoves([
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		])

		p1.makeMove({ x: 2, y: 0 })

 */

export const winByConsecutiveHorizontalPlacements: GameWinCondition = (
	newMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => {
	// check if top left 3 are a win
	const placements = gameState.moves.map(move => move.placement)

	const participants = _.uniq(gameState.moves.map(move => move.mover))

	for (const currentParticipant of participants) {
		const placementsByCurrentPlayer = gameState.moves
			.filter(move => move.mover === currentParticipant)
			.sort((move1, move2) => move1.placement.x - move2.placement.x)
			.map(move => move.placement)

		const allYs = placementsByCurrentPlayer.map(placement => placement.y)

		for (const yCoordinate of allYs) {
			const currentRow = placementsByCurrentPlayer.filter(placement => placement.y === yCoordinate)
			if (currentRow.length < 3) continue
			for (let placementsChunk of overlappingChunks(currentRow, 3)) {
				if (placementsChunk[placementsChunk.length - 1].x - placementsChunk[0].x === 2) {
					return true
				}
			}
		}
	}

	return false
}

export const standardWinConditions: readonly GameWinCondition[] = [
	winByConsecutiveVerticalPlacements,
	winByConsecutiveHorizontalPlacements,
]

function overlappingChunks<TItem>(array: TItem[], chunkSize: number) {
	if (chunkSize <= 0 || chunkSize > array.length) {
		throw new Error("Invalid chunk size")
	}

	const result = []
	for (let i = 0; i <= array.length - chunkSize; i++) {
		result.push(array.slice(i, i + chunkSize))
	}

	return result
}
