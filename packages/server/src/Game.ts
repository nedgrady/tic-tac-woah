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
	#emitter: EventEmitter = new EventEmitter()

	start() {
		this.#emitter.emit("Start")
	}

	submitMove(move: Move) {
		this.#movesReal.push(move)
		this.#emitter.emit("Move", move)
	}

	moves() {
		return this.#movesReal
	}

	constructor(participants: Participant[]) {
		participants.forEach(participant => (participant.game = this))
	}
}
