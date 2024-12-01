import { Move } from "../Move"
import { Participant } from "../Participant"

export type GameRuleFunction = (newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) => boolean

// TODO - move probably to types
export interface GameConfiguration {
	// TODO - well interestingly we could omit this altogether
	// and just use a moveMustBeWithinTheBoard with a specific board size
	readonly boardSize: number
	readonly consecutiveTarget: number
	// TODO - add rules?
}

// TODO - move probably NOT to types? (?)
export interface GameState {
	readonly moves: readonly Move[]
	readonly participants: readonly Participant[]
}

export const moveMustBeWithinTheBoard: GameRuleFunction = (
	newMove: Move,
	_gameState: GameState,
	gameConfiguration: GameConfiguration,
) => {
	return (
		newMove.placement.x >= 0 &&
		newMove.placement.y >= 0 &&
		newMove.placement.x < gameConfiguration.boardSize &&
		newMove.placement.y < gameConfiguration.boardSize
	)
}

export const moveMustBeMadeByTheCorrectPlayer: GameRuleFunction = (
	newMove: Move,
	gameState: GameState,
	_: GameConfiguration,
) => {
	return newMove.mover === gameState.participants[gameState.moves.length % gameState.participants.length]
}

export const moveMustBeMadeIntoAFreeSquare: GameRuleFunction = (
	newMove: Move,
	gameState: GameState,
	_: GameConfiguration,
) => {
	return !gameState.moves.some(
		existingMove =>
			existingMove.placement.x === newMove.placement.x && existingMove.placement.y === newMove.placement.y,
	)
}

export const standardRules: readonly GameRuleFunction[] = [
	moveMustBeWithinTheBoard,
	moveMustBeMadeByTheCorrectPlayer,
	moveMustBeMadeIntoAFreeSquare,
]
