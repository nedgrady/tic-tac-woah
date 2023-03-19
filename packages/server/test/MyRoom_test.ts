import assert from "assert"
import { ColyseusTestServer, boot } from "@colyseus/testing"

// import your "arena.config.ts" file here.
import appConfig from "../src/arena.config"
import { QueueRoomState } from "../src/rooms/schema/QueueRoomState"

describe("testing your Colyseus app", () => {
	let colyseus: ColyseusTestServer

	before(async () => (colyseus = await boot(appConfig)))
	after(async () => colyseus.shutdown())

	beforeEach(async () => await colyseus.cleanup())

	it("connecting into a room", async () => {
		// `room` is the server-side Room instance reference.
		const room = await colyseus.createRoom<QueueRoomState>("my_room", {})

		// `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
		const client1 = await colyseus.connectTo(room)

		// make your assertions
		assert.strictEqual(client1.sessionId, room.clients[0].sessionId)

		// wait for state sync
		await room.waitForNextPatch()

		assert.deepStrictEqual({ mySynchronizedProperty: 1 }, client1.state.toJSON())
	})
})
