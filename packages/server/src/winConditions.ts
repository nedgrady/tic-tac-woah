import _ from "lodash"
import { Move } from "./Move"
import { GameConfiguration, GameState } from "./gameRules"
import { G } from "vitest/dist/types-dea83b3d"
import { pl } from "@faker-js/faker"

export type GameWinCondition = (
	latestMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => GameWinConditionResult

export type GameWinConditionResult = GameWin | GameContinues

export interface GameWin {
	// TODO - better name for this
	readonly result: "win"
	readonly winningMoves: readonly Move[]
}

export interface GameContinues {
	readonly result: "continues"
}

const continueGame: GameWinConditionResult = { result: "continues" }

export const winByConsecutiveVerticalPlacements: GameWinCondition = (
	latestMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => {
	const placementsByCurrentPlayer = gameState.moves
		.filter(move => move.mover === latestMove.mover)
		.sort((move1, move2) => move1.placement.y - move2.placement.y)
		.map(move => move.placement)

	const allXs = placementsByCurrentPlayer.map(placement => placement.x)

	for (const xCoordinate of allXs) {
		const currentColumn = placementsByCurrentPlayer.filter(placement => placement.x === xCoordinate)
		if (currentColumn.length < gameConfiguration.consecutiveTarget) continue
		for (let placementsChunk of overlappingChunks(currentColumn, gameConfiguration.consecutiveTarget)) {
			if (
				placementsChunk[placementsChunk.length - 1].y - placementsChunk[0].y ===
				gameConfiguration.consecutiveTarget - 1
			) {
				return {
					result: "win",
					winningMoves: placementsChunk.map(placement => ({ mover: latestMove.mover, placement })),
				}
			}
		}
	}

	return continueGame
}

export const winByConsecutiveHorizontalPlacements: GameWinCondition = (
	latestMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => {
	const participants = _.uniq(gameState.moves.map(move => move.mover))

	for (const currentParticipant of participants) {
		let placementsByCurrentPlayer = gameState.moves
			.filter(move => move.mover === currentParticipant)
			.sort((move1, move2) => move1.placement.x - move2.placement.x)
			.map(move => move.placement)

		const allYs = placementsByCurrentPlayer.map(placement => placement.y)

		for (const yCoordinate of allYs) {
			const currentRow = placementsByCurrentPlayer.filter(placement => placement.y === yCoordinate)
			if (currentRow.length < gameConfiguration.consecutiveTarget) continue
			for (let placementsChunk of overlappingChunks(currentRow, gameConfiguration.consecutiveTarget)) {
				if (
					placementsChunk[placementsChunk.length - 1].x - placementsChunk[0].x ===
					gameConfiguration.consecutiveTarget - 1
				) {
					return {
						result: "win",
						winningMoves: placementsChunk.map(placement => ({ mover: currentParticipant, placement })),
					}
				}
			}
		}
	}

	return continueGame
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
