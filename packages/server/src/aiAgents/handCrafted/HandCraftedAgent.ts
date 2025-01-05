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
import { DecideWhoMayMoveNext } from "../../domain/moveOrderRules/moveOrderRules"
import { singleParticipantInSequence } from "../../domain/moveOrderRules/singleParticipantInSequence"

export class HandCraftedAgent extends AiParticipant {
	name: string = "HandCraftedAgent"

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		const gameTree = new GameTree(game, singleParticipantInSequence)
		const winningMove = gameTree.bestMoveForParticipant(participant)
		return { mover: participant, placement: winningMove }
	}
}

// function findWinningMoves(game: Game, moves: Move[], participant: Participant) {
// 	const directlyWinningMoves = findDirectWinningMoves(game, participant)
// 	if (directlyWinningMoves.length > 0) {
// 		return directlyWinningMoves
// 	}

// 	const nextAvailableMovers = game.nextAvailableMovers()
// }

// // create iterator function returning all free squares
// function findFreeSquares(game: Game): Coordinates[] {
// 	const allSquares = _.product(_.range(game.boardSize), _.range(game.boardSize)).map(([x, y]) => ({
// 		x,
// 		y,
// 	})) as Coordinates[]

// 	return _.differenceWith(
// 		allSquares,
// 		game.moves().map(m => m.placement),
// 		_.isEqual,
// 	)
// }

// function findDirectWinningMoves(game: Game, participant: Participant) {
// 	const freeSquares = findFreeSquares(game)

// 	const winRules = [
// 		winByConsecutiveHorizontalPlacements,
// 		winByConsecutiveDiagonalPlacements,
// 		winByConsecutiveVerticalPlacements,
// 	]

// 	const winningMoves = winRules.flatMap(rule =>
// 		freeSquares.filter(
// 			square =>
// 				rule(
// 					{ mover: participant, placement: square },
// 					{
// 						moves: [...game.moves(), { mover: participant, placement: square }],
// 						participants: game.participants,
// 					},
// 					game.gameConfiguration,
// 				).result === "win",
// 		),
// 	)

// 	return winningMoves
// }

// For now assuming we're rotating players in sequence from the last move supplied in the ctor
class GameTree {
	readonly maxDepth: number = 5

	readonly root: GameTreeNode

	constructor(
		readonly game: Game,
		readonly moveOrder: DecideWhoMayMoveNext,
	) {
		this.root = new GameTreeNode(this, game.moves(), 0)
	}

	bestMoveForParticipant(participant: Participant): Coordinates {
		const winningMoves = this.root.directlyWinningMoves(participant)
		return winningMoves[0] ?? this.root.freeSquares()[0]
	}
}

class GameTreeNode {
	constructor(
		private readonly gameTree: GameTree,
		private readonly madeMoves: readonly Move[],
		private readonly depth: number,
	) {}

	directlyWinningMoves(participant: Participant): Coordinates[] {
		const freeSquares = this.freeSquares()

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
							moves: [...this.madeMoves, { mover: participant, placement: square }],
							participants: this.gameTree.game.participants,
						},
						this.gameTree.game.gameConfiguration,
					).result === "win",
			),
		)

		return winningMoves
	}

	freeSquares(): Coordinates[] {
		const allSquares = _.product(
			_.range(this.gameTree.game.boardSize),
			_.range(this.gameTree.game.consecutiveTarget),
		).map(([x, y]) => ({
			x,
			y,
		})) as Coordinates[]

		return _.differenceWith(
			allSquares,
			this.madeMoves.map(madeMove => madeMove.placement),
			_.isEqual,
		)
	}

	nextPossibleNodes(): GameTreeNode[] {
		if (this.depth >= this.gameTree.maxDepth) {
			return []
		}

		const nextAvailableMovers = this.gameTree.moveOrder({
			moves: this.madeMoves,
			participants: this.gameTree.game.participants,
		})

		const freeSquares = this.freeSquares()

		return []
	}
}
