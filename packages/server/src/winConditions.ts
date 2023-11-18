import _ from "lodash"
import { Move } from "./Move"
import { GameState, GameConfiguration } from "./gameRules"

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
	let placementsByCurrentPlayer = gameState.moves
		.filter(move => move.mover === latestMove.mover)
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
					winningMoves: placementsChunk.map(placement => ({ mover: latestMove.mover, placement })),
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

export function overlappingChunks<TItem>(array: TItem[], chunkSize: number) {
	if (chunkSize <= 0 || chunkSize > array.length) {
		throw new Error("Invalid chunk size")
	}

	const result = []
	for (let i = 0; i <= array.length - chunkSize; i++) {
		result.push(array.slice(i, i + chunkSize))
	}

	return result
}
export const winByConsecutiveDiagonalPlacements: GameWinCondition = (
	latestMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration
) => {
	// TODO there needs to be sorts in here
	// So write some test cases that cover that scenario
	// Rotate all coordinates 45 degrees about the origin
	// using (x, y) -> (x + y, y - x)
	// to inverse use (x', y') -> ([x' - y'] / 2, [x' + y'] / 2])
	// now we have the 'diagonals' nicely lined up in rows & columns :-)
	const rotatedMoves = gameState.moves
		.filter(move => move.mover === latestMove.mover)
		.map(move => ({
			...move,
			placement: {
				x: move.placement.x + move.placement.y,
				y: move.placement.y - move.placement.x,
			},
		}))

	// Check the rows of the rotated coordinates, which in reality are NW -> SE diagonals
	// But remember to step by 2 since we've rotated the grid
	const allYs = rotatedMoves.map(move => move.placement.y)

	for (const yCoordinate of allYs) {
		const currentRow = rotatedMoves.filter(placement => placement.placement.y === yCoordinate)
		if (currentRow.length < gameConfiguration.consecutiveTarget) continue
		for (let movesChunk of overlappingChunks(currentRow, gameConfiguration.consecutiveTarget)) {
			if (
				movesChunk[movesChunk.length - 1].placement.x - movesChunk[0].placement.x ===
				(gameConfiguration.consecutiveTarget - 1) * 2
			) {
				// Found a win, don't forget to rotate the coordinates back!
				return {
					result: "win",
					winningMoves: movesChunk.map(winningMove => ({
						mover: latestMove.mover,
						placement: {
							x: (winningMove.placement.x - winningMove.placement.y) / 2,
							y: (winningMove.placement.x + winningMove.placement.y) / 2,
						},
					})),
				}
			}
		}
	}

	// Check the columns of the rotated coordinates, which in reality are SW -> NEdiagonals
	// But remember to step by 2 since we've rotated the grid
	const allXs = rotatedMoves.map(placement => placement.placement.x)

	for (const xCoordinate of allXs) {
		const currentColumn = rotatedMoves.filter(move => move.placement.x === xCoordinate)
		if (currentColumn.length < gameConfiguration.consecutiveTarget) continue
		for (let placementsChunk of overlappingChunks(currentColumn, gameConfiguration.consecutiveTarget)) {
			if (
				placementsChunk[placementsChunk.length - 1].placement.y - placementsChunk[0].placement.y ===
				(gameConfiguration.consecutiveTarget - 1) * 2
			) {
				return {
					result: "win",
					winningMoves: placementsChunk.map(winningMove => ({
						mover: latestMove.mover,
						placement: {
							x: (winningMove.placement.x - winningMove.placement.y) / 2,
							y: (winningMove.placement.x + winningMove.placement.y) / 2,
						},
					})),
				}
			}
		}
	}

	return { result: "continues" }
}
