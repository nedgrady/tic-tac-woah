import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime, startAndConnect } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it, test } from "vitest"
import { faker } from "@faker-js/faker"
import { GameStartDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "GameFactory"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

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
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.clientSocket.emitWithAck("joinQueue", {})

		return testContext.done
	})

	it("Clears the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})

	it("Game start is sent to the first player", () => {
		const moves = testContext.clientSocket.events.get("gameStart")
		expect(moves).toContainEqual<GameStartDto>({
			id: expect.any(String),
			players: expect.arrayContaining(twoUsers),
		})
	})

	it("Game start is sent to the second player", () => {
		const moves = testContext.clientSocket2.events.get("gameStart")
		expect(moves).toContainEqual<GameStartDto>({
			id: expect.any(String),
			players: expect.arrayContaining(twoUsers),
		})
	})

	it("The game id is the same for both players", () => {
		const gameId1 = testContext.clientSocket.events.get("gameStart")[0].id
		const gameId2 = testContext.clientSocket2.events.get("gameStart")[0].id

		expect(gameId1).toEqual(gameId2)
	})
})
