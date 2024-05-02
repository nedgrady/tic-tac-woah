import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { MatchTwoGamesOfTwo } from "matchmaking/MatchmakingStrategy"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "playing/GameFactory"
import { joinQueueRequestFactory } from "testingUtilities/factories"
import _ from "lodash"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new MatchTwoGamesOfTwo()))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 4)

	beforeAll(async () => {
		await testContext.start()

		_.range(0, 4).forEach(i => {
			testContext.clientSockets[i].emit("joinQueue", joinQueueRequestFactory.build())
		})

		return testContext.done
	})

	it.each(_.range(0, 4))("Sends a game start to connection %d", async connectionIndex => {
		await vi.waitFor(() => {
			expect(testContext.clientSockets[connectionIndex]).toHaveReceivedEvent("gameStart")
		})
	})

	it("Clears the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})
})
