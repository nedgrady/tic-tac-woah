import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { AlwaysMatchFirstTwoParticipants } from "matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "playing/support/ReturnSingleGameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { gameIsAlwaysDrawn } from "domain/drawConditions/support/gameIsAlwaysDrawn"
import { GameDrawDto } from "types"
import { joinQueueRequestFactory } from "testingUtilities/factories"

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
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({
						endConditions: [gameIsAlwaysDrawn],
					})
				)
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket2.emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSocket2).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSocket.emit("makeMove", {
			...drawingMove,
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("Sends the winning move to participant 1", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket).toHaveReceivedEvent("gameDraw"))
	})

	it("Sends the winning move to participant 2", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket2).toHaveReceivedEvent("gameDraw"))
	})

	it("Sends the correct move information to participant 1", async () => {
		const expectedGameDraw: GameDrawDto = {
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		}
		expect(testContext.clientSocket).toHaveReceivedPayload("gameDraw", expectedGameDraw)
	})

	it("Sends the correct move information to participant 2", async () => {
		const expectedGameDraw: GameDrawDto = {
			gameId: testContext.clientSocket2.events.get("gameStart")[0].id,
		}
		expect(testContext.clientSocket2).toHaveReceivedPayload("gameDraw", expectedGameDraw)
	})

	it("Both gameDraws have the same gameId", async () => {
		const gameWin1 = testContext.clientSocket.events.get("gameWin")[0]
		const gameWin2 = testContext.clientSocket2.events.get("gameWin")[0]
		expect(gameWin1).toEqual(gameWin2)
	})
})
