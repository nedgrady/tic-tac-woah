import { Move } from "domain/Move"
import { GameConfiguration, GameState } from "domain/gameRules/gameRules"
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
