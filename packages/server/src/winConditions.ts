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

export const standardWinConditions: readonly GameWinCondition[] = [winByConsecutiveVerticalPlacements]

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
