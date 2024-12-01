import { GameState, GameConfiguration } from "../../gameRules/gameRules"
import { Move } from "../../Move"
import { GameWinCondition, continueGame } from "../winConditions"

export const gameIsWonOnMoveNumber: (moveNumber: number) => GameWinCondition =
	(moveNumber: number) => (newMove: Move, gameState: GameState, _: GameConfiguration) => {
		if (gameState.moves.length === moveNumber) {
			return {
				result: "win",
				winningMoves: [newMove],
			}
		}

		return continueGame
	}
