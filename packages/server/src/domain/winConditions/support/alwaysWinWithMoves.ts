import { Move } from "domain/Move"
import { GameWinCondition } from "../winConditions"

export const alwaysWinWithMoves: (moves: Move[]) => GameWinCondition = (moves: Move[]) => () => {
	return {
		result: "win",
		winningMoves: moves,
	}
}
