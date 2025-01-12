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
import { vi } from "vitest"

export class HandCraftedAgent extends AiParticipant {
	name: string = "HandCraftedAgent"

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		const gameTree = new GameTree(game, singleParticipantInSequence)

		return { mover: participant, placement: { x: 0, y: 1 } }
	}
}

// For now assuming we're rotating players in sequence from the last move supplied in the ctor
class GameTree {
	readonly maxDepth: number = 2

	readonly root: GameTreeNode

	constructor(
		readonly game: Game,
		readonly moveOrder: DecideWhoMayMoveNext,
	) {
		this.root = new GameTreeNode(this, null, game.moves(), 0)
	}
}

class GameTreeNode {
	private readonly mover: Participant
	constructor(
		private readonly gameTree: GameTree,
		private readonly parent: GameTreeNode | null,
		private readonly madeMoves: readonly Move[],
		private readonly depth: number,
	) {
		// For now assuming only 1 player can move
		this.mover = _.last(this.madeMoves)!.mover
	}

	isWinningStateForParticipant(participant: Participant): boolean {
		if (this.mover !== participant) return false

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
					participants: this.gameTree.game.participants,
				},
				this.gameTree.game.gameConfiguration,
			),
		)

		const ret = winRuleResults.some(
			result =>
				result.result === "win" && result.winningMoves.some(winningMove => winningMove.mover === participant),
		)

		return winRuleResults.some(
			result =>
				result.result === "win" && result.winningMoves.some(winningMove => winningMove.mover === participant),
		)
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

		const nodesToReturn = []

		for (const mover of nextAvailableMovers) {
			for (const freeSquare of freeSquares) {
				const newMove = { mover, placement: freeSquare }

				nodesToReturn.push(new GameTreeNode(this.gameTree, this, [...this.madeMoves, newMove], this.depth + 1))
			}
		}

		return nodesToReturn
	}

	lineOfMovesToGetToNode(): Move[] {
		if (this.parent === null) {
			return []
		}

		return [...this.parent.lineOfMovesToGetToNode(), _.last(this.madeMoves)!]
	}

	moves(): Move[] {
		return [...this.madeMoves]
	}
}

class BreadthFirstSearchVisitor {
	constructor() {}

	visit(startNode: GameTreeNode, action: (node: GameTreeNode, depth: number) => void) {
		const queue: Queue<{ node: GameTreeNode; depth: number }> = new Queue()

		queue.enqueue({ node: startNode, depth: 0 })

		while (!queue.isEmpty()) {
			const pair = queue.dequeue()!

			action(pair.node, pair.depth)

			for (const child of pair.node.nextPossibleNodes()) {
				queue.enqueue({ node: child, depth: pair.depth + 1 })
			}
		}
	}
}

class Queue<TITem> {
	private items: TITem[] = []

	// Enqueue an element to the end of the queue
	enqueue(item: TITem): void {
		this.items.push(item)
	}

	// Dequeue an element from the front of the queue
	dequeue(): TITem | undefined {
		return this.items.shift()
	}

	// Check if the queue is empty
	isEmpty(): boolean {
		return this.items.length === 0
	}

	// Get the size of the queue
	size(): number {
		return this.items.length
	}

	// Peek at the front element of the queue without removing it
	peek(): TITem | undefined {
		return this.items[0]
	}
}
