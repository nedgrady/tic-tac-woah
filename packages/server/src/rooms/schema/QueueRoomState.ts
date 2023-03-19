import { Schema, Context, type } from "@colyseus/schema"

export class QueueRoomState extends Schema {
	@type("number") depth: number = 0
}
