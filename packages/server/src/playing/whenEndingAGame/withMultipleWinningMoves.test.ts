import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameWinDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "GameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { alwaysWinWithMoves } from "domain/winConditions/winConditions"

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

	const alwaysWinningGame = new Game([""], 10, 10, [anyMoveIsAllowed], [alwaysWinWithMoves(winningMoves)], [])
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
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory(alwaysWinningGame)))
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
			...winningMoves[0],
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it("Sends the winning move to participant 1", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket.events.get("gameWin")).toHaveLength(1))
	})

	it("Sends the winning move to participant 2", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket2.events.get("gameWin")).toHaveLength(1))
	})

	it("Sends the correct move information to participant 1", async () => {
		const gameWin = testContext.clientSocket.events.get("gameWin")[0]
		const expectedGameWin: GameWinDto = {
			winningMoves: winningMoves.map(move => ({
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				mover: move.mover,
				placement: move.placement,
			})),
		}
		expect(gameWin).toMatchObject(expectedGameWin)
	})

	it("Sends the correct move information to participant 2", async () => {
		const gameWin = testContext.clientSocket2.events.get("gameWin")[0]
		const expectedGameWin: GameWinDto = {
			winningMoves: winningMoves.map(move => ({
				gameId: testContext.clientSocket.events.get("gameStart")[0].id,
				mover: move.mover,
				placement: move.placement,
			})),
		}
		expect(gameWin).toMatchObject(expectedGameWin)
		expect(gameWin).toMatchObject(expectedGameWin)
	})
})
