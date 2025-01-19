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
import { AiParticipantFactory } from "../AiParticipantFactory"

export class HandCraftedAgentParticipantFactory extends AiParticipantFactory {
	createAiAgent(): AiParticipant {
		return new HandCraftedAgent()
	}
}

export class HandCraftedAgent extends AiParticipant {
	name: string = "HandCraftedAgent"

	async nextMove(game: Game, participant: Participant): Promise<Move> {
		const gameTree = new GameTree(game, singleParticipantInSequence)

		// const minMaxVal = this.minimax(gameTree.root, 0, true)
		// console.log(minMaxVal.node.moves())
		// console.log(minMaxVal.value)

		// console.log(this.minimax(gameTree.root, 0, true))

		// gameTree.root.nextPossibleNodes().forEach(node => {
		// 	// console.log(node.moves())
		// 	console.log("1 ", this.minimax(node, 0, true).value, this.minimax(node, 0, true).node.moves())
		// })

		// console.log("root")
		// console.log(this.minimax(gameTree.root as GameTreeNode, 0, false).value)
		// console.log(this.minimax(gameTree.root as GameTreeNode, 0, false).node.moves())

		const nextEvaluations = gameTree.root
			.nextPossibleNodes()
			// { mover: 'X', placement: { x: 0, y: 2 } },
			.map(node => {
				// console.log(this.minimax(node as GameTreeNode, 0, false).value)
				return this.minimax(node as GameTreeNode, 0, false)
			})

		// const bfs = new BreadthFirstSearchVisitor()
		// bfs.visit(nextEvaluations[0].node, (node, depth) => {
		// 	console.log(depth, node.lineOfMovesToGetToNode(), this.minimax(node, 0, depth % 2 == 0).value)
		// })

		// console.log()

		// console.log(best?.node.lineOfMovesToGetToNode(), best?.value)

		// console.log("0 " + gameTree.root.staticEvaluation(false))
		// console.log("-----")

		// gameTree.root.nextPossibleNodes().forEach(node => {
		// 	console.log("1 " + node.staticEvaluation(true))
		// })

		// console.log("-------")

		// gameTree.root
		// 	.nextPossibleNodes()
		// 	.flatMap(node => node.nextPossibleNodes())
		// 	.forEach(node => {
		// 		console.log("===")
		// 		console.log("2 ", node.staticEvaluation(false), node.moves())
		// 	})

		// console.log("-------")

		// gameTree.root
		// 	.nextPossibleNodes()
		// 	.flatMap(node => node.nextPossibleNodes())
		// 	.flatMap(node => node.nextPossibleNodes())
		// 	.forEach(node => {
		// 		console.log("***")
		// 		if (_.last(node.moves())?.placement.x === 2 && _.last(node.moves())?.placement.y === 0)
		// 			console.log("3 ", node.staticEvaluation(true), node.moves())
		// 	})

		// for (const evaluation of _.orderBy(nextEvaluations, "value", "desc")) {
		// 	console.log(evaluation.node.moves(), evaluation.value)
		// }
		const ret = _.orderBy(nextEvaluations, "value", "asc")[0].node.lineOfMovesToGetToNode()[0]
		console.log("Returning move", ret)
		return ret
	}

	prettyPrintGameTree(node: GameTreeNode, depth: number, isMaximizing: boolean): void {
		const indent = " ".repeat(depth * 2)
		const evaluation = this.minimax(node, 0, isMaximizing)
		console.log(`${indent}Move: ${JSON.stringify(node.madeMove())}, Evaluation: ${evaluation.value}`)
		for (const child of node.nextPossibleNodes()) {
			this.prettyPrintGameTree(child, depth + 1, !isMaximizing)
		}
	}

	minimax(node: GameTreeNode, depth: number, isMaximizing: boolean): Evaluation {
		if (node.isTerminalNode()) {
			return { node, value: node.staticEvaluation(isMaximizing) }
		}

		if (isMaximizing) {
			let bestEvaluation = { node, value: -Infinity }

			for (const child of node.nextPossibleNodes()) {
				const evaluation = this.minimax(child, depth + 1, false)

				if (evaluation.value > bestEvaluation.value) {
					bestEvaluation = evaluation
				}
			}

			return bestEvaluation
		} else {
			let bestEvaluation = { node, value: Infinity }

			const evaluations = node.nextPossibleNodes().map(child => this.minimax(child, depth + 1, true))

			for (const child of node.nextPossibleNodes()) {
				const evaluation = this.minimax(child, depth + 1, true)

				if (evaluation.value < bestEvaluation.value) {
					bestEvaluation = evaluation
				}
			}

			return bestEvaluation
		}
	}
}

interface Evaluation {
	readonly node: GameTreeNode
	readonly value: number
}

// For now assuming we're rotating players in sequence from the last move supplied in the ctor
class GameTree {
	readonly maxDepth: number = 8

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

		if (this.isTerminalNode()) {
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

	madeMove(): Move {
		return _.last(this.madeMoves)!
	}

	isTerminalNode(): boolean {
		if (this.freeSquares().length === 0) return true

		for (const participant of this.gameTree.game.participants) {
			if (this.isWinningStateForParticipant(participant)) return true
		}

		return false
	}

	staticEvaluation(isMaximizing: boolean): number {
		const mover = isMaximizing ? this.gameTree.game.participants[0] : this.gameTree.game.participants[1]
		const win = this.isWinningStateForParticipant(mover)

		if (win) {
			const ret = isMaximizing ? 1000 - this.depth : -1000 + this.depth
			// if (_.last(this.madeMoves)?.placement.x === 2 && _.last(this.madeMoves)?.placement.y === 1) {
			// 	console.log("here")
			// 	console.log("2,2 val", ret)
			// }

			return ret
		}

		return 0
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
