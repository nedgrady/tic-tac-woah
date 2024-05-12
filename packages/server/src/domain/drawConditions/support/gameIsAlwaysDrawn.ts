import { GameDrawCondition } from "../drawConditions"

export const gameIsAlwaysDrawn: GameDrawCondition = () => {
	return { result: "draw" }
}
