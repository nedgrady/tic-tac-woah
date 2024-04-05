import { ActiveUser } from "TicTacWoahSocketServer"
import { EventEmitter } from "node:events"
import TypedEmitter from "typed-emitter"

type MatchmakingEvents = {
	matchMade: (participants: readonly ActiveUser[], aiParticipantCount: number) => void
}

export class MatchmakingBroker {
	private _eventEmitter = new EventEmitter() as TypedEmitter<MatchmakingEvents>
	public notifyMatchMade(participants: readonly ActiveUser[], aiParticipantCount: number) {
		this._eventEmitter.emit("matchMade", participants, aiParticipantCount)
	}

	public onMatchMade(callback: MatchmakingEvents["matchMade"]) {
		this._eventEmitter.on("matchMade", callback)
	}
}

type MatchmakingTickEvents = {
	matchmakingTick: (queueState: readonly ActiveUser[]) => void
}

export class MatchmakingTickBroker {
	private _eventEmitter = new EventEmitter() as TypedEmitter<MatchmakingTickEvents>
	public queueChange(queueState: readonly ActiveUser[]) {
		this._eventEmitter.emit("matchmakingTick", queueState)
	}

	public onTick(callback: (queueState: readonly ActiveUser[]) => void) {
		this._eventEmitter.on("matchmakingTick", callback)
	}
}
