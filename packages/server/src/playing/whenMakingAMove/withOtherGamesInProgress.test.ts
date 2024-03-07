import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnectCountReal } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { MoveDto } from "types"

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
	const fourParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Game B player 0",
		"Game B player 1",
	]

	const testContext = new GetTestContext()

	beforeAll(async () => {
		const preConfigure = (server: TicTacWoahSocketServer) => {
			server
				.use(
					identifySocketsInSequence(
						fourParticipants.map(handle => ({
							connections: new Set(),
							uniqueIdentifier: handle,
						}))
					)
				)
				.use(addConnectionToQueue(queue))
				.use(matchmaking(queue))
			// TODO - what middleware to add?
		}

		testContext.value = await startAndConnectCountReal(4, preConfigure)

		await testContext.value.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.value.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		await testContext.value.clientSockets[2].emitWithAck("joinQueue", {})
		await testContext.value.clientSockets[3].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[2].events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSockets[3].events.get("gameStart")).toHaveLength(1)
		})

		testContext.value.clientSockets[0].emit("makeMove", {
			mover: fourParticipants[0],
			placement: {
				x: 0,
				y: 0,
			},
		})

		testContext.value.clientSockets[2].emit("makeMove", {
			mover: fourParticipants[2],
			placement: {
				x: 9,
				y: 9,
			},
		})

		// await vi.waitFor(() => {
		// 	expect(testContext.value.clientSockets[0].events.get("moveMade")).toHaveLength(1)
		// 	expect(testContext.value.clientSockets[1].events.get("moveMade")).toHaveLength(1)
		// 	expect(testContext.value.clientSockets[2].events.get("moveMade")).toHaveLength(1)
		// 	expect(testContext.value.clientSockets[3].events.get("moveMade")).toHaveLength(1)
		// })

		return testContext.value.done
	})

	it.each([0, 1])("Game A player %s only receives the relevant move", async playerIndex => {
		await vi.waitFor(() => {
			const moves = testContext.value.clientSockets[playerIndex].events.get("moveMade")
			expect(moves).toContainSingle<MoveDto>({
				mover: fourParticipants[0],
				placement: {
					x: 0,
					y: 0,
				},
			})
		})
	})

	it.each([2, 3])("Game A player %s only receives the relevant move", async playerIndex => {
		await vi.waitFor(() => {
			const moves = testContext.value.clientSockets[playerIndex].events.get("moveMade")
			expect(moves).toContainSingle<MoveDto>({
				mover: fourParticipants[2],
				placement: {
					x: 9,
					y: 9,
				},
			})
		})
	})
})
