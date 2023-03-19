import { Client, Room } from "colyseus"
import { QueueRoomState } from "./schema/QueueRoomState"

export class QueueRoom extends Room<QueueRoomState> {
	onCreate(options: any) {
		this.setState(new QueueRoomState())

		this.onMessage("type", (client, message) => {
			//
			// handle "type" message
			//
		})
	}

	onJoin(client: Client, options: any) {
		this.state.depth++
	}

	onLeave(client: Client, consented: boolean) {
		this.state.depth--
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...")
	}
}
