import { ReturnSingleGameFactory } from "playing/GameFactory"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { TicTacWoahUserHandle, TicTacWoahSocketServer, TicTacWoahRemoteServerSocket } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { Game } from "domain/Game"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime, startAndConnect } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"

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
					}))
				)
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()
		await testContext.clientSocket.emitWithAck("joinQueue", {})
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		return testContext.done
	})

	it("does not create a game", () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("gameStart")
	})
})
