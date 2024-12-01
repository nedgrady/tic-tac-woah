import { vi, expect, beforeAll, describe, it } from "vitest"

import _ from "lodash"
import { identifySocketsByWebSocketId } from "../../auth/socketIdentificationStrategies"
import { startGameOnMatchMade } from "../../playing/startGameOnMatchMade"
import { AnythingGoesForeverGameFactory } from "../../playing/support/AnythingGoesForeverGameFactory"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { matchmaking } from "../matchmaking"
import { MatchmakingBroker } from "../MatchmakingBroker"
import { MatchTwoGamesOfTwo } from "../support/MatchTwoGamesOfTwo"

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
