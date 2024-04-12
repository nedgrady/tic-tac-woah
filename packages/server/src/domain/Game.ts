import { Move } from "./Move"
import { Participant } from "./Participant"
import { EventEmitter } from "events"
import { GameConfiguration, GameRuleFunction, GameState } from "./gameRules/gameRules"
import { GameDrawCondition, GameWinCondition } from "./winConditions/winConditions"
import { DecideWhoMayMoveNext } from "./moveOrderRules/moveOrderRules"

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
	readonly #endConditions: readonly GameDrawCondition[]
	readonly #decideWhoMayMoveNext: DecideWhoMayMoveNext

	readonly #onParticipantMayMoveEmitters = new Map<string, EventEmitter>()

	onWin(listener: GameWonListener) {
		this.#emitter.on("Winning Move", listener)
	}

	onDraw(listener: GameDrawListener) {
		this.#emitter.on("Draw", listener)
	}

	onMoveCompleted(listener: (move: Move) => void) {
		this.#emitter.on("Move", listener)
	}

	onStart(listener: () => void) {
		this.#emitter.on("Start", listener)
	}

	onParticipantMayMove(participant: Participant, arg1: () => void) {
		const emitter = new EventEmitter()
		emitter.on("Participant May Move", arg1)
		this.#onParticipantMayMoveEmitters.set(participant, emitter)
	}

	private fireAvailableMovers() {
		const nextAvailableMovers = this.#decideWhoMayMoveNext({
			moves: this.#movesReal,
			participants: this.#participants,
		})

		nextAvailableMovers.forEach(mover => {
			this.#onParticipantMayMoveEmitters.get(mover)?.emit("Participant May Move")
		})
	}

	start() {
		this.#emitter.emit("Start")
		this.fireAvailableMovers()
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

		const nextAvailableMovers = this.#decideWhoMayMoveNext({
			moves: this.#movesReal,
			participants: this.#participants,
		})

		if (!nextAvailableMovers.includes(newMove.mover)) {
			return
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

		for (const endCondition of this.#endConditions) {
			const thing = endCondition(newMove, gameState, gameConfiguration)
			if (thing.result === "draw") {
				this.#emitter.emit("Draw")
				return
			}
		}

		this.fireAvailableMovers()
	}

	moves(): readonly Move[] {
		return this.#movesReal
	}

	// readonly property
	get participants(): readonly Participant[] {
		return this.#participants
	}

	constructor(options: CreateGameOptions) {
		this.#participants = options.participants
		this.#boardSize = options.boardSize ?? 20
		this.#consecutiveTarget = options.consecutiveTarget ?? 999
		this.#rules = options.rules
		this.#winConditions = options.winConditions
		this.#endConditions = options.endConditions
		this.#decideWhoMayMoveNext = options.decideWhoMayMoveNext
	}
}

export interface CreateGameOptions {
	participants: readonly Participant[]
	boardSize?: number
	consecutiveTarget?: number
	rules: readonly GameRuleFunction[]
	winConditions: readonly GameWinCondition[]
	endConditions: readonly GameDrawCondition[]
	decideWhoMayMoveNext: DecideWhoMayMoveNext
}
