import { vi, expect, beforeAll, describe, it } from "vitest"
import _ from "lodash"
import { identifySocketsByWebSocketId } from "../../auth/socketIdentificationStrategies"
import { startGameOnMatchMade } from "../../playing/startGameOnMatchMade"
import { AnythingGoesForeverGameFactory } from "../../playing/support/AnythingGoesForeverGameFactory"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { queueItemFactory, joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { matchmaking } from "../matchmaking"
import { MatchmakingBroker } from "../MatchmakingBroker"
import { AlwaysMatchFirstTwoParticipants } from "../support/AlwaysMatchFirstTwoParticipants"

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
		queue.addItem(
			queueItemFactory.build({
				queuer: { uniqueIdentifier: "User 1" },
				consecutiveTarget: 2,
				humanCount: 2,
			}),
		)

		queue.addItem(
			queueItemFactory.build({
				queuer: { uniqueIdentifier: "User 2" },
				consecutiveTarget: 2,
				humanCount: 2,
			}),
		)

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
