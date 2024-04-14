import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { AlwaysMatchTwoParticipants, matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "playing/GameFactory"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const threeParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Remains in queue",
	]
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
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchTwoParticipants()))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 3)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSockets[1]).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSockets[0]).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSockets[0].emit("makeMove", {
			placement: {
				x: 0,
				y: 0,
			},
			gameId: testContext.clientSockets[0].events.get("gameStart")[0].id,
		})
		await vi.waitFor(() => {
			expect(testContext.clientSockets[1]).toHaveReceivedEvent("moveMade")
			expect(testContext.clientSockets[0]).toHaveReceivedEvent("moveMade")
		})

		return testContext.done
	})

	it("Player remaining in queue does not receive unrelated moves", () => {
		const moves = testContext.clientSockets[2].events.get("moveMade")
		expect(moves).toHaveLength(0)
	})
})
