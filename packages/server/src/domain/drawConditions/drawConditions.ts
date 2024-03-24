import { GameDrawCondition } from "domain/winConditions/winConditions"

export const gameIsDrawnWhenBoardIsFull: GameDrawCondition = (latestMove, gameState, gameConfiguration) => {
	const boardCapacity = gameConfiguration.boardSize ** 2
	if (gameState.moves.length === boardCapacity) {
		return { result: "draw" }
	}

	return { result: "continues" }
}

export const gameIsAlwaysDrawn: GameDrawCondition = () => {
	return { result: "draw" }
}
