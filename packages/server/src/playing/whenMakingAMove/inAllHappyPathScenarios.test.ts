import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { CompletedMoveDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { AnythingGoesForeverGameFactory } from "GameFactory"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const fistMove = {
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}
	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSocket2.events.get("gameStart")).toHaveLength(1)
			expect(testContext.clientSocket.events.get("gameStart")).toHaveLength(1)
		})

		testContext.clientSocket.emit("makeMove", {
			...fistMove,
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("The move is sent to the first player", async () => {
		await vi.waitFor(() =>
			expect(testContext.clientSocket.events.get("moveMade")).toContainEqual(
				expect.objectContaining<CompletedMoveDto>({
					...fistMove,
					mover: testContext.clientSocket.id,
					gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				})
			)
		)
	})
	it("The move is sent to the second player", async () => {
		await vi.waitFor(() =>
			expect(testContext.clientSocket2.events.get("moveMade")).toContainEqual(
				expect.objectContaining<CompletedMoveDto>({
					...fistMove,
					mover: testContext.clientSocket.id,
					gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				})
			)
		)
	})

	it("First player does not receive a win event", async () => {
		expect(testContext.clientSocket.events.get("gameWin")).toHaveLength(0)
	})

	it("Second player does not receive a win event", async () => {
		expect(testContext.clientSocket2.events.get("gameWin")).toHaveLength(0)
	})
})
