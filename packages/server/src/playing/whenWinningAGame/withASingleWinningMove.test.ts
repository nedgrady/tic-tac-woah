import { faker } from "@faker-js/faker"
import { GameWinDto } from "@tic-tac-woah/types"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifySocketsInSequence } from "../../auth/socketIdentificationStrategies"
import { alwaysWinWithMoves } from "../../domain/winConditions/support/alwaysWinWithMoves"
import { matchmaking } from "../../matchmaking/matchmaking"
import { MatchmakingBroker } from "../../matchmaking/MatchmakingBroker"
import { AlwaysMatchFirstTwoParticipants } from "../../matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { startGameOnMatchMade } from "../startGameOnMatchMade"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

	const winningMove = {
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
					})),
				),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({ winConditions: [alwaysWinWithMoves([winningMove])] }),
				),
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket2.emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSocket2).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSocket2).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSocket.emit("makeMove", {
			...winningMove,
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("Sends the winning move to participant 1", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket).toHaveReceivedEvent("gameWin"))
	})

	it("Sends the winning move to participant 2", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket2).toHaveReceivedEvent("gameWin"))
	})

	it("Sends the correct move information to participant 1", async () => {
		const expectedGameWin: GameWinDto = {
			winningMoves: [
				{
					mover: winningMove.mover,
					placement: winningMove.placement,
					gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				},
			],
		}
		expect(testContext.clientSocket).toHaveReceivedPayload("gameWin", expectedGameWin)
	})

	it("Sends the correct move information to participant 2", async () => {
		const expectedGameWin: GameWinDto = {
			winningMoves: [
				{
					mover: winningMove.mover,
					placement: winningMove.placement,
					gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				},
			],
		}
		expect(testContext.clientSocket2).toHaveReceivedPayload("gameWin", expectedGameWin)
	})
})
