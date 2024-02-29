import { TicTacWoahUserHandle, TicTacWoahSocketServer, ClientToServerEvents } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect, startAndConnectCount, startAndConnectCountReal } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameStartDto, MoveDto } from "types"

const uninitializedContext = {} as Awaited<ReturnType<typeof startAndConnectCountReal>>

class GetTestContext {
	private _value: Awaited<ReturnType<typeof startAndConnectCountReal>>

	constructor() {
		this._value = uninitializedContext
	}

	public get value(): Awaited<ReturnType<typeof startAndConnectCountReal>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}
	public set value(v: Awaited<ReturnType<typeof startAndConnectCountReal>>) {
		this._value = v
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"player one",
		"player two",
		"remains in queue",
	]

	const fistMove: MoveDto = {
		mover: twoUsers[0],
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}

	const testContext = new GetTestContext()

	beforeAll(async () => {
		const preConfigure = (server: TicTacWoahSocketServer) => {
			server
				.use(
					identifySocketsInSequence(
						twoUsers.map(handle => ({
							connections: new Set(),
							uniqueIdentifier: handle,
						}))
					)
				)
				.use(addConnectionToQueue(queue))
				.use(matchmaking(queue))
			// TODO - what middleware to add?
		}

		testContext.value = await startAndConnectCountReal(3, preConfigure)

		await testContext.value.clientSockets[4].emitWithAck("joinQueue", {})
		await testContext.value.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSocket2.events.get("moveMade")).toHaveLength(1)
			expect(testContext.value.clientSocket.events.get("moveMade")).toHaveLength(1)
		})

		await testContext.value.clientSocket.emitWithAck("makeMove", fistMove)

		return testContext.value.done
	})

	it("The move is sent to the first player", async () => {
		await vi.waitFor(() =>
			expect(testContext.value.clientSocket.events.get("moveMade")).toContainEqual(
				expect.objectContaining(fistMove)
			)
		)
	})
})
