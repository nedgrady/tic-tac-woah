import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime, startAndConnectCount } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { CompletedMoveDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "GameFactory"

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

	const testContext = new StartAndConnectLifetime(preConfigure, 4)

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
