import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "MatchmakingBroker"
import { ReturnSingleGameFactory } from "GameFactory"
import { Game } from "domain/Game"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const fistMove = {
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}

	const allMovesAreInvalidGame = new Game([""], 10, 10, [() => false], [], [], () => [""])

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory(allMovesAreInvalidGame)))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSocket2).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSocket.emit("makeMove", {
			...fistMove,
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("The move is sent to the first player", async () => {
		await vi.waitFor(() =>
			expect(testContext.clientSocket).toHaveReceivedPayload("moveMade", {
				...fistMove,
				mover: testContext.clientSocket.id,
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
			})
		)
	})
	it("The move is sent to the second player", async () => {
		await vi.waitFor(() =>
			expect(testContext.clientSocket2).toHaveReceivedPayload("moveMade", {
				...fistMove,
				mover: testContext.clientSocket.id,
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
			})
		)
	})

	it("First player does not receive a win event", async () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("gameWin")
	})

	it("Second player does not receive a win event", async () => {
		expect(testContext.clientSocket2).not.toHaveReceivedEvent("gameWin")
	})
})
