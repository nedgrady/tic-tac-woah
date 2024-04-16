import { EventEmitter } from "node:events"
import TypedEmitter from "typed-emitter"
import { MadeMatch } from "./MatchmakingStrategy"

type MatchmakingEvents = {
	matchMade: (participants: MadeMatch) => void
}

export class MatchmakingBroker {
	private _eventEmitter = new EventEmitter() as TypedEmitter<MatchmakingEvents>
	public notifyMatchMade(madeMatch: MadeMatch) {
		this._eventEmitter.emit("matchMade", madeMatch)
	}

	public onMatchMade(callback: (madeMatch: MadeMatch) => void) {
		this._eventEmitter.on("matchMade", callback)
	}
}
