import { GameDrawCondition } from "domain/winConditions/winConditions"

export const gameIsAlwaysDrawn: GameDrawCondition = () => {
	return { result: "draw" }
}
