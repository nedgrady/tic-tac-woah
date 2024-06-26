import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { AlwaysMatchFirstTwoParticipants } from "matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameWinDto } from "types"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "playing/support/ReturnSingleGameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { alwaysWinWithMoves } from "domain/winConditions/support/alwaysWinWithMoves"
import { joinQueueRequestFactory } from "testingUtilities/factories"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

	const winningMoves = [
		{
			mover: twoUsers[1],
			placement: {
				x: faker.number.int(),
				y: faker.number.int(),
			},
		},
		{
			mover: twoUsers[1],
			placement: {
				x: faker.number.int(),
				y: faker.number.int(),
			},
		},
	]

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
						winConditions: [alwaysWinWithMoves(winningMoves)],
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
			...winningMoves[0],
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
			winningMoves: winningMoves.map(move => ({
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				mover: move.mover,
				placement: move.placement,
			})),
		}
		expect(testContext.clientSocket).toHaveReceivedPayload("gameWin", expectedGameWin)
	})

	it("Sends the correct move information to participant 2", async () => {
		const expectedGameWin: GameWinDto = {
			winningMoves: winningMoves.map(move => ({
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				mover: move.mover,
				placement: move.placement,
			})),
		}
		expect(testContext.clientSocket2).toHaveReceivedPayload("gameWin", expectedGameWin)
	})
})
