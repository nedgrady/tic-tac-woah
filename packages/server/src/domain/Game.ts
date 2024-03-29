import { Move } from "./Move"
import { Participant } from "./Participant"
import { EventEmitter } from "events"
import _ from "lodash"
import { GameConfiguration, GameRuleFunction, GameState } from "./gameRules/gameRules"
import { GameDrawCondition, GameWinCondition } from "./winConditions/winConditions"

export type GameWonListener = (winningMoves: readonly Move[]) => void
export type GameDrawListener = () => void

export class Game {
	readonly #consecutiveTarget: number
	readonly #movesReal: Move[] = []
	readonly #participants: readonly Participant[]
	readonly #emitter: EventEmitter = new EventEmitter()
	readonly #boardSize: number
	readonly #rules: readonly GameRuleFunction[]
	readonly #winConditions: readonly GameWinCondition[]

	onWin(listener: GameWonListener) {
		this.#emitter.on("Winning Move", listener)
	}

	onDraw(listener: GameDrawListener) {
		this.#emitter.on("Draw", listener)
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
			consecutiveTarget: this.#consecutiveTarget,
		}

		const gameState: GameState = {
			moves: this.#movesReal,
			participants: this.#participants,
		}

		for (const rule of this.#rules) {
			if (!rule(newMove, gameState, gameConfiguration)) {
				return
			}
		}

		this.#movesReal.push(newMove)
		this.#emitter.emit("Move", newMove)

		for (const winCondition of this.#winConditions) {
			const thing = winCondition(newMove, gameState, gameConfiguration)
			if (thing.result === "win") {
				this.#emitter.emit("Winning Move", thing.winningMoves)
				return
			}
		}

		for (const endCondition of this.endConditions) {
			const thing = endCondition(newMove, gameState, gameConfiguration)
			if (thing.result === "draw") {
				this.#emitter.emit("Draw")
				return
			}
		}
	}

	moves(): readonly Move[] {
		return this.#movesReal
	}

	// readonly property
	get participants(): readonly Participant[] {
		return this.#participants
	}

	constructor(
		participants: readonly Participant[],
		boardSize: number = 20,
		consecutiveTarget: number = 9999,
		rules: readonly GameRuleFunction[],
		winConditions: readonly GameWinCondition[],
		private endConditions: readonly GameDrawCondition[]
	) {
		this.#participants = participants
		this.#boardSize = boardSize
		this.#consecutiveTarget = consecutiveTarget
		this.#rules = rules
		this.#winConditions = winConditions
	}
}
