import "lodash.product"
import _ from "lodash"
import Coordinates from "../../domain/Coordinates"
import { Game } from "../../domain/Game"
import { Move } from "../../domain/Move"
import { Participant } from "../../domain/Participant"
import { AiParticipant } from "../AiParticipant"
import {
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveVerticalPlacements,
} from "../../domain/winConditions/winConditions"

export class HandCraftedAgent extends AiParticipant {
	name: string = "HandCraftedAgent"

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		const winningMoves = findDirectWinningMoves(game, participant)
		console.log("winningMoves", winningMoves)
		return { mover: participant, placement: winningMoves[0] ?? findFreeSquares(game)[0] }
	}
}

// create iterator function returning all free squares
function findFreeSquares(game: Game): Coordinates[] {
	const allSquares = _.product(_.range(game.boardSize), _.range(game.boardSize)).map(([x, y]) => ({
		x,
		y,
	})) as Coordinates[]

	return _.differenceWith(
		allSquares,
		game.moves().map(m => m.placement),
		_.isEqual,
	)
}

function findDirectWinningMoves(game: Game, participant: Participant) {
	const freeSquares = findFreeSquares(game)

	const winRules = [
		winByConsecutiveHorizontalPlacements,
		winByConsecutiveDiagonalPlacements,
		winByConsecutiveVerticalPlacements,
	]

	const winningMoves = winRules.flatMap(rule =>
		freeSquares.filter(
			square =>
				rule(
					{ mover: participant, placement: square },
					{
						moves: [...game.moves(), { mover: participant, placement: square }],
						participants: game.participants,
					},
					game.gameConfiguration,
				).result === "win",
		),
	)

	return winningMoves
}
