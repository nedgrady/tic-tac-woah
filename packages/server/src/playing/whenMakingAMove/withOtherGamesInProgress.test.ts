import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnectCount } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { CompletedMoveDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "GameFactory"

const uninitializedContext = {} as Awaited<ReturnType<typeof startAndConnectCount>>

class GetTestContext {
	private _value: Awaited<ReturnType<typeof startAndConnectCount>>

	constructor() {
		this._value = uninitializedContext
	}

	public get value(): Awaited<ReturnType<typeof startAndConnectCount>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}
	public set value(v: Awaited<ReturnType<typeof startAndConnectCount>>) {
		this._value = v
	}
}

class StartAndConnectCountLifetime {
	private _value: Awaited<ReturnType<typeof startAndConnectCount>>
	private _args: Parameters<typeof startAndConnectCount>

	constructor(...args: Parameters<typeof startAndConnectCount>) {
		this._value = uninitializedContext
		this._args = args
	}

	private get value(): Awaited<ReturnType<typeof startAndConnectCount>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}

	async start() {
		this._value = await startAndConnectCount(...this._args)
	}

	public get done() {
		return this.value.done
	}

	public get clientSockets() {
		return this.value.clientSockets
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectCountLifetime(4, preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		await testContext.clientSockets[2].emitWithAck("joinQueue", {})
		await testContext.clientSockets[3].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSockets[2].events.get("gameStart")).toHaveLength(1)
			expect(testContext.clientSockets[3].events.get("gameStart")).toHaveLength(1)
		})

		testContext.clientSockets[0].emit("makeMove", {
			placement: {
				x: 0,
				y: 0,
			},
			gameId: testContext.clientSockets[0].events.get("gameStart")[0].id,
		})

		testContext.clientSockets[2].emit("makeMove", {
			placement: {
				x: 9,
				y: 9,
			},
			gameId: testContext.clientSockets[2].events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it.each([0, 1])("Game A player %s only receives the relevant move", async playerIndex => {
		const events = testContext.clientSockets[playerIndex].events
		await vi.waitFor(() => {
			const moves = events.get("moveMade")
			expect(moves).toContainSingle<CompletedMoveDto>({
				mover: testContext.clientSockets[0].id,
				placement: {
					x: 0,
					y: 0,
				},
				gameId: events.get("gameStart")[0].id,
			})
		})
	})

	it.each([2, 3])("Game A player %s only receives the relevant move", async playerIndex => {
		const events = testContext.clientSockets[playerIndex].events

		await vi.waitFor(() => {
			const moves = events.get("moveMade")
			expect(moves).toContainSingle<CompletedMoveDto>({
				mover: testContext.clientSockets[2].id,
				placement: {
					x: 9,
					y: 9,
				},
				gameId: events.get("gameStart")[0].id,
			})
		})
	})
})
