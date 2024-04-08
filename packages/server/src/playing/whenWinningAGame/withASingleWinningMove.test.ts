import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime, startAndConnect } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameWinDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "GameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/support/anyMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { alwaysWinWithMoves } from "domain/winConditions/support/alwaysWinWithMoves"

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
					}))
				)
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({ winConditions: [alwaysWinWithMoves([winningMove])] })
				)
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.clientSocket.emitWithAck("joinQueue", {})

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
