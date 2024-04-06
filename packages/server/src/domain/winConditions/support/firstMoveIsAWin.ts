import { GameWinCondition } from "../winConditions"

export const firstMoveIsAWin: GameWinCondition = latestMove => ({
	result: "win",
	winningMoves: [latestMove],
})
