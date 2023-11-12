import { Mock } from "vitest"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { EventEmitter } from "events"
import _ from "lodash"

// TODO should this return something else e.g. a string?
type GameRuleFunction = (newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) => boolean

interface GameConfiguration {
	readonly boardSize: number
	readonly target: number

	//readonly rules: readonly GameRuleFunction[]
}

interface GameState {
	readonly moves: readonly Move[]
	readonly participants: readonly Participant[]
}

function moveMustBeWithinTheBoard(newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) {
	return (
		newMove.placement.x >= 0 &&
		newMove.placement.y >= 0 &&
		newMove.placement.x < gameConfiguration.boardSize &&
		newMove.placement.y < gameConfiguration.boardSize
	)
}

function moveMustBeMadeByTheCorrectPlayer(newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) {
	return newMove.mover === gameState.participants[gameState.moves.length % gameState.participants.length]
}

function moveMustBeMadeIntoAFreeSquare(newMove: Move, gameState: GameState, gameConfiguration: GameConfiguration) {
	return !gameState.moves.some(
		existingMove =>
			existingMove.placement.x === newMove.placement.x && existingMove.placement.y === newMove.placement.y
	)
}

const standardRules = [moveMustBeWithinTheBoard, moveMustBeMadeByTheCorrectPlayer, moveMustBeMadeIntoAFreeSquare]

export class Game {
	readonly #target: number
	readonly #movesReal: Move[] = []
	readonly #participants: readonly Participant[]
	readonly #emitter: EventEmitter = new EventEmitter()
	readonly #boardSize: number
	readonly #rules: readonly GameRuleFunction[]

	onWin(listener: () => void) {
		this.#emitter.on("Winning Move", listener)
	}

	onMove(listener: (move: Move) => void) {
		this.#emitter.on("Move", listener)
	}
	onStart(listener: () => void) {
		this.#emitter.on("Start", listener)
	}

	start() {
		this.#emitter.emit("Start")
	}

	submitMove(newMove: Move) {
		const gameConfiguration: GameConfiguration = {
			boardSize: this.#boardSize,
			target: this.#target,
		}

		const gameState: GameState = {
			moves: this.#movesReal,
			participants: this.#participants,
		}

		for (let rule of this.#rules) {
			if (!rule(newMove, gameState, gameConfiguration)) {
				return
			}
		}

		this.#movesReal.push(newMove)
		this.#emitter.emit("Move", newMove)

		const movesByCurrentPlayer = this.#movesReal
			.filter(move => move.mover === newMove.mover)
			.sort((move1, move2) => move1.placement.y - move2.placement.y)

		if (movesByCurrentPlayer.length < this.#target) return

		for (let placementsChunk of overlappingChunks(movesByCurrentPlayer, this.#target)) {
			if (
				placementsChunk[placementsChunk.length - 1].placement.y - placementsChunk[0].placement.y ===
				this.#target - 1
			) {
				this.#emitter.emit("Winning Move")
			}
		}
	}

	moves() {
		return this.#movesReal
	}

	constructor(
		participants: readonly Participant[],
		boardSize: number = 20,
		target: number = 9999,
		rules: readonly GameRuleFunction[] = standardRules
	) {
		participants.forEach((participant, index) => {
			participant.game = this
			;(participant as any).idx = index
		})
		this.#participants = participants
		this.#boardSize = boardSize
		this.#target = target
		this.#rules = rules
	}
}

function overlappingChunks<TItem>(array: TItem[], chunkSize: number) {
	if (chunkSize <= 0 || chunkSize > array.length) {
		throw new Error("Invalid chunk size")
	}

	const result = []
	for (let i = 0; i <= array.length - chunkSize; i++) {
		result.push(array.slice(i, i + chunkSize))
	}

	return result
}
