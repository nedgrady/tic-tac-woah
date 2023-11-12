import { Move } from "./Move"
import { Participant } from "./Participant"
import { EventEmitter } from "events"

export class Game {
	onMove(listener: (move: Move) => void) {
		this.#emitter.on("Move", listener)
	}
	onStart(listener: () => void) {
		this.#emitter.on("Start", listener)
	}

	readonly #movesReal: Move[] = []
	readonly #participants: readonly Participant[]
	readonly #emitter: EventEmitter = new EventEmitter()
	readonly #boardSize: number

	start() {
		this.#emitter.emit("Start")
	}

	submitMove(move: Move) {
		if (move.placement.x < 0 || move.placement.y < 0) return

		if (move.placement.x >= this.#boardSize || move.placement.y >= this.#boardSize) return

		// Ensure the move is made by the correct participant
		if (move.mover !== this.#participants[this.#movesReal.length % this.#participants.length]) {
			return
		}

		this.#movesReal.push(move)
		this.#emitter.emit("Move", move)
	}

	moves() {
		return this.#movesReal
	}

	constructor(participants: readonly Participant[], boardSize: number = 20) {
		participants.forEach(participant => (participant.game = this))
		this.#participants = participants
		this.#boardSize = boardSize
	}
}
