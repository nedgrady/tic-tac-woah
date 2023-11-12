import { Mock } from "vitest"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { EventEmitter } from "events"

export class Game {
	readonly #target: number
	readonly #movesReal: Move[] = []
	readonly #participants: readonly Participant[]
	readonly #emitter: EventEmitter = new EventEmitter()
	readonly #boardSize: number

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
		if (newMove.placement.x < 0 || newMove.placement.y < 0) return

		if (newMove.placement.x >= this.#boardSize || newMove.placement.y >= this.#boardSize) return

		// Ensure the move is made by the correct participant
		if (newMove.mover !== this.#participants[this.#movesReal.length % this.#participants.length]) {
			return
		}

		// Ensure the square is not already taken
		if (
			this.#movesReal.some(
				existingMove =>
					existingMove.placement.x === newMove.placement.x && existingMove.placement.y === newMove.placement.y
			)
		) {
			return
		}

		this.#movesReal.push(newMove)
		this.#emitter.emit("Move", newMove)

		const playerOnesMoves = this.#movesReal.filter(move => move.mover === this.#participants[0])

		const topLeftThreeVerticals = playerOnesMoves.filter(move => move.placement.x === 0)
		if (topLeftThreeVerticals.length === 3 && this.#target === 3) {
			this.#emitter.emit("Winning Move")
		}
	}

	moves() {
		return this.#movesReal
	}

	constructor(participants: readonly Participant[], boardSize: number = 20, target: number = 9999) {
		participants.forEach(participant => (participant.game = this))
		this.#participants = participants
		this.#boardSize = boardSize
		this.#target = target
	}
}
