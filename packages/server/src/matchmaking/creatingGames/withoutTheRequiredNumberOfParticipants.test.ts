import { vi, expect, beforeAll, describe, it } from "vitest"
import { identifySocketsInSequence } from "../../auth/socketIdentificationStrategies"
import { startGameOnMatchMade } from "../../playing/startGameOnMatchMade"
import { ReturnSingleGameFactory } from "../../playing/support/ReturnSingleGameFactory"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { matchmaking } from "../matchmaking"
import { MatchmakingBroker } from "../MatchmakingBroker"
import { AlwaysMatchFirstTwoParticipants } from "../support/AlwaysMatchFirstTwoParticipants"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User 1", "User 2"]

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifySocketsInSequence(
					twoUsers.map(handle => ({
						connections: new Set(),
						uniqueIdentifier: handle,
					})),
				),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()
		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		return testContext.done
	})

	it("does not create a game", () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("gameStart")
	})
})
