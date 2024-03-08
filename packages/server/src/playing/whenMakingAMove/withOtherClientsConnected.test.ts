import {
	TicTacWoahUserHandle,
	TicTacWoahSocketServer,
	ClientToServerEvents,
	TicTacWoahEventMap,
} from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect, startAndConnectCount, startAndConnectCountReal } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameStartDto, MoveDto } from "types"
import { Move } from "domain/Move"
import { StrongMap } from "utilities/StrongMap"

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
	const threeParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Remains in queue",
	]

	const testContext = new GetTestContext()

	beforeAll(async () => {
		const preConfigure = (server: TicTacWoahSocketServer) => {
			server
				.use(
					identifySocketsInSequence(
						threeParticipants.map(handle => ({
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

		await testContext.value.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.value.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		testContext.value.clientSockets[0].emit("makeMove", {
			mover: threeParticipants[0],
			placement: {
				x: 0,
				y: 0,
			},
			gameId: testContext.value.clientSockets[0].events.get("gameStart")[0].id,
		})
		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[0].events.get("moveMade")).toHaveLength(1)
			expect(testContext.value.clientSockets[1].events.get("moveMade")).toHaveLength(1)
		})

		return testContext.value.done
	})

	it("Player remaining in queue does not receive unrelated moves", () => {
		const moves = testContext.value.clientSockets[2].events.get("moveMade")
		expect(moves).toHaveLength(0)
	})
})
