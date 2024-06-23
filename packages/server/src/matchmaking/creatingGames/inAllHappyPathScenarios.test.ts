import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { AlwaysMatchFirstTwoParticipantsWithRules } from "matchmaking/support/AlwaysMatchFirstTwoParticipantsWithRules"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "playing/support/AnythingGoesForeverGameFactory"
import { joinQueueRequestFactory, madeMatchRulesFactory } from "testingUtilities/factories"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]
	const matchedRules = madeMatchRulesFactory.build()

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
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipantsWithRules(matchedRules)))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket2.emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		return testContext.done
	})

	it("Clears the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})

	it("Game start is sent to the first player", async () => {
		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedPayload("gameStart", {
				id: expect.any(String),
				players: expect.arrayContaining(twoUsers),
				rules: matchedRules,
			})
		})
	})

	it("Game start is sent to the second player", async () => {
		await vi.waitFor(() => {
			expect(testContext.clientSocket2).toHaveReceivedPayload("gameStart", {
				id: expect.any(String),
				players: expect.arrayContaining(twoUsers),
				rules: matchedRules,
			})
		})
	})

	it("The game id is the same for both players", async () => {
		await vi.waitFor(() => {
			const gameId1 = testContext.clientSocket.events.get("gameStart")[0].id
			const gameId2 = testContext.clientSocket2.events.get("gameStart")[0].id

			expect(gameId1).toEqual(gameId2)
		})
	})

	it("The game only caontains the two players", async () => {
		await vi.waitFor(() => {
			const players = testContext.clientSocket.events.get("gameStart")[0].players

			expect(players).toHaveLength(2)
		})
	})

	it("The game only caontains the two players 2", async () => {
		await vi.waitFor(() => {
			const players = testContext.clientSocket2.events.get("gameStart")[0].players

			expect(players).toHaveLength(2)
		})
	})
})
