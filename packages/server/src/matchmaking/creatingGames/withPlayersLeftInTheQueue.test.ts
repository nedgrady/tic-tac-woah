import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { AlwaysMatchFirstTwoParticipants } from "matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "playing/support/AnythingGoesForeverGameFactory"
import { joinQueueRequestFactory } from "testingUtilities/factories"
import _ from "lodash"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 3)

	beforeAll(async () => {
		queue.addItem({
			queuer: { connections: new Set(), uniqueIdentifier: "User 1" },
			consecutiveTarget: 2,
			humanCount: 2,
		})

		queue.addItem({
			queuer: { connections: new Set(), uniqueIdentifier: "User 2" },
			consecutiveTarget: 2,
			humanCount: 2,
		})
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		return testContext.done
	})

	it("Leaves the remaining queuer in the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})
	})
})
