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

	#movesReal: Move[] = []
	#participants: readonly Participant[]
	#emitter: EventEmitter = new EventEmitter()

	start() {
		this.#emitter.emit("Start")
	}

	submitMove(move: Move) {
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

	constructor(participants: readonly Participant[]) {
		participants.forEach(participant => (participant.game = this))
		this.#participants = participants
	}
}
