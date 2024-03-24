import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "GameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { gameIsAlwaysDrawn } from "domain/drawConditions/drawConditions"
import { GameDrawDto } from "types"
import { isObject } from "lodash"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

	const drawingMove = {
		mover: twoUsers[0],
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}

	const alwaysDrawingGame = new Game([""], 10, 10, [anyMoveIsAllowed], [], [gameIsAlwaysDrawn])

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
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory(alwaysDrawingGame)))
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
			...drawingMove,
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("Sends the winning move to participant 1", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket.events.get("gameDraw")).toHaveLength(1))
	})

	it("Sends the winning move to participant 2", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket2.events.get("gameDraw")).toHaveLength(1))
	})

	it("Sends the correct move information to participant 1", async () => {
		const receivedGameDraw = testContext.clientSocket.events.get("gameDraw")[0]
		const expectedGameDraw: GameDrawDto = {
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		}
		expect(receivedGameDraw).toMatchObject(expectedGameDraw)
	})

	it("Sends the correct move information to participant 2", async () => {
		const receivedGameDraw = testContext.clientSocket2.events.get("gameDraw")[0]
		const expectedGameDraw: GameDrawDto = {
			gameId: testContext.clientSocket2.events.get("gameStart")[0].id,
		}
		expect(receivedGameDraw).toMatchObject(expectedGameDraw)
	})

	it("Both gameDraws have the same gameId", async () => {
		const gameWin1 = testContext.clientSocket.events.get("gameWin")[0]
		const gameWin2 = testContext.clientSocket2.events.get("gameWin")[0]
		expect(gameWin1).toEqual(gameWin2)
	})
})
