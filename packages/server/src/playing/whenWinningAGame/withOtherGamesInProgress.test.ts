import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { AlwaysMatchTwoParticipants } from "matchmaking/MatchmakingStrategy"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { ReturnSequenceOfGamesFactory } from "playing/GameFactory"
import { gameIsWonOnMoveNumber } from "domain/winConditions/support/gameIsWonOnMoveNumber"
import { joinQueueRequestFactory } from "testingUtilities/factories"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const fourParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Game B player 0",
		"Game B player 1",
	]

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
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchTwoParticipants()))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSequenceOfGamesFactory(
						{ winConditions: [gameIsWonOnMoveNumber(1)] },
						{
							/* we don't really care about how this game is configured */
						}
					)
				)
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 4)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSockets[0].emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSockets[1].emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSockets[0]).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSockets[1]).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSockets[2].emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSockets[3].emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSockets[2]).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSockets[3]).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSockets[0].emit("makeMove", {
			...winningMove,
			gameId: testContext.clientSockets[0].events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it.each([0, 1])("Sends the winning move to participant %s", async clientIndex => {
		await vi.waitFor(() => expect(testContext.clientSockets[clientIndex]).toHaveReceivedEvent("gameWin"))
	})

	it.each([2, 3])("Does not send the winning move to the unrelated participant %s", async clientIndex => {
		await vi.waitFor(() => expect(testContext.clientSockets[clientIndex]).not.toHaveReceivedEvent("gameWin"))
	})
})
