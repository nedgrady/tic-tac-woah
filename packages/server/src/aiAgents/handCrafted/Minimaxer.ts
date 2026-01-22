import { s } from "vite/dist/node/types.d-aGj9QkWt"
import Coordinates from "../../domain/Coordinates"
import { Game } from "../../domain/Game"
import { Move } from "../../domain/Move"
import { DecideWhoMayMoveNext } from "../../domain/moveOrderRules/moveOrderRules"
import { Participant } from "../../domain/Participant"
import {
	winByConsecutiveHorizontalPlacements,
	winByConsecutiveDiagonalPlacements,
	winByConsecutiveVerticalPlacements,
} from "../../domain/winConditions/winConditions"
import _ from "lodash"
import { g } from "vitest/dist/suite-IbNSsUWN"

// TODO - make this a generic interface
export type PlayerEvaluations = Map<string, number>

export interface GameState<TMove extends { mover: string }> {
	getPossibleMoves(): readonly TMove[]
	applyMove(move: TMove): GameState<TMove>
	evaluate(): PlayerEvaluations // Evaluation function returning a score
	isTerminal(): boolean // Checks if the game is over
	players(): readonly string[]
}

export function minimaxMultiPlayer<TMove extends { mover: string }>(
	state: GameState<TMove>,
	depth: number,
	currentPlayerId: string,
): Map<string, number> {
	const scores = new Map<string, number>()

	if (depth === 0 || state.isTerminal()) {
		return state.evaluate()
	}

	const possibleMoves = state.getPossibleMoves()
	const results: Map<TMove, PlayerEvaluations> = new Map()

	for (const move of possibleMoves) {
		const newState = state.applyMove(move)
		const nextMover = move.mover
		const newScores = minimaxMultiPlayer(newState, depth - 1, nextMover)
		results.set(move, newScores)
	}

	if (results.size > 0) {
		// Initialize best scores with the first result's scores
		// let bestScores = results[0]
		// for (const currentScores of results) {
		// 	if (currentScores.get(currentPlayerId)! > bestScores.get(currentPlayerId)!) {
		// 		bestScores = currentScores
		// 	}
		// }
		// return bestScores
		let bestScoresForCurrentPlayer: PlayerEvaluations | null = null

		for (const [_, scores] of results) {
			const currentPlayerScore = scores.get(currentPlayerId)!
			if (
				bestScoresForCurrentPlayer === null ||
				currentPlayerScore > bestScoresForCurrentPlayer.get(currentPlayerId)!
			) {
				bestScoresForCurrentPlayer = scores
			}
		}

		return bestScoresForCurrentPlayer!
	}

	// Default return if no moves are available
	return scores
}

// =================================================================================================

export class TtwGameState implements GameState<Move> {
	constructor(
		readonly game: Game,
		readonly moveOrder: DecideWhoMayMoveNext,
		readonly madeMoves: Move[],
	) {}

	get nextStates(): GameState<Move>[] {
		const possibleMoves = this.getPossibleMoves()
		return possibleMoves.map(move => this.applyMove(move))
	}

	players(): readonly string[] {
		return this.game.participants
	}

	getPossibleMoves(): Move[] {
		// if (this.depth >= this.gameTree.maxDepth) {
		// 	return []
		// }

		if (this.isTerminal()) {
			return []
		}

		const nextAvailableMovers = this.moveOrder({
			moves: this.madeMoves,
			participants: this.game.participants,
		})

		const freeSquares = this.freeSquares()

		const movesToReturn = []

		for (const mover of nextAvailableMovers) {
			for (const freeSquare of freeSquares) {
				const newMove = { mover, placement: freeSquare }

				movesToReturn.push(newMove)
			}
		}

		return movesToReturn
	}

	applyMove(move: Move): GameState<Move> {
		const newMadeMoves = [...this.madeMoves, move]

		return new TtwGameState(this.game, this.moveOrder, newMadeMoves)
	}

	evaluate(): PlayerEvaluations {
		const evaluations: PlayerEvaluations = new Map<string, number>()

		for (const participant of this.game.participants) {
			evaluations.set(participant, this.evaluateParticipant(participant))
		}

		return evaluations
	}

	evaluateParticipant(participant: string): number {
		if (this.isWinningStateForParticipant(participant)) {
			return 1000
		}

		return 0
	}

	isTerminal(): boolean {
		if (this.freeSquares().length === 0) return true

		for (const participant of this.game.participants) {
			if (this.isWinningStateForParticipant(participant)) return true
		}

		return false
	}

	isWinningStateForParticipant(participant: Participant): boolean {
		const winRules = [
			winByConsecutiveHorizontalPlacements,
			winByConsecutiveDiagonalPlacements,
			winByConsecutiveVerticalPlacements,
		]

		const winRuleResults = winRules.map(rule =>
			rule(
				_.last(this.madeMoves)!,
				{
					moves: this.madeMoves,
					participants: this.game.participants,
				},
				this.game.gameConfiguration,
			),
		)

		return winRuleResults.some(
			result =>
				result.result === "win" && result.winningMoves.some(winningMove => winningMove.mover === participant),
		)
	}

	freeSquares(): Coordinates[] {
		const allSquares = _.product(_.range(this.game.boardSize), _.range(this.game.boardSize)).map(([x, y]) => ({
			x,
			y,
		})) as Coordinates[]

		return _.differenceWith(
			allSquares,
			this.madeMoves.map(madeMove => madeMove.placement),
			_.isEqual,
		)
	}
}
