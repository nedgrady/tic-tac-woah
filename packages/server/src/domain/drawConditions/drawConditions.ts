import { Move } from "domain/Move"
import { GameState, GameConfiguration } from "domain/gameRules/gameRules"
import { GameContinues } from "domain/winConditions/winConditions"

type GameDrawConditionResult = GameDraw | GameContinues
export type GameDrawCondition = (
	latestMove: Move,
	gameState: GameState,
	gameConfiguration: GameConfiguration,
) => GameDrawConditionResult
export interface GameDraw {
	readonly result: "draw"
}

export const gameIsDrawnWhenBoardIsFull: GameDrawCondition = (latestMove, gameState, gameConfiguration) => {
	const boardCapacity = gameConfiguration.boardSize ** 2
	if (gameState.moves.length === boardCapacity) {
		return { result: "draw" }
	}

	return { result: "continues" }
}
