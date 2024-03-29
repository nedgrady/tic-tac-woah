import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSequenceOfGamesFactory } from "GameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { gameIsWonOnMoveNumber } from "domain/winConditions/winConditions"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const fourParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Game B player 0",
		"Game B player 1",
	]
	const alwaysWinningGame = new Game([""], 10, 10, [anyMoveIsAllowed], [gameIsWonOnMoveNumber(1)], [])
	const anythingGoesGame = new Game([], 10, 10, [anyMoveIsAllowed], [], [])

	const winningMove = {
		mover: fourParticipants[0],
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifySocketsInSequence(
					fourParticipants.map(handle => ({
						connections: new Set(),
						uniqueIdentifier: handle,
					}))
				)
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSequenceOfGamesFactory(alwaysWinningGame, anythingGoesGame)
				)
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 4)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		await testContext.clientSockets[2].emitWithAck("joinQueue", {})
		await testContext.clientSockets[3].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		testContext.clientSockets[0].emit("makeMove", {
			...winningMove,
			gameId: testContext.clientSockets[0].events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it.each([0, 1])("Sends the winning move to participant %s", async clientIndex => {
		await vi.waitFor(() => expect(testContext.clientSockets[clientIndex].events.get("gameWin")).toHaveLength(1))
	})

	it.each([2, 3])("Does not send the winning move to the unrelated participant %s", async clientIndex => {
		await vi.waitFor(() => expect(testContext.clientSockets[clientIndex].events.get("gameWin")).toHaveLength(0))
	})
})
