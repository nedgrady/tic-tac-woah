import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnectCount } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSequenceOfGamesFactory } from "GameFactory"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { gameIsWonOnMoveNumber } from "domain/winConditions/winConditions"

const uninitializedContext = {} as Awaited<ReturnType<typeof startAndConnectCount>>

class GetTestContext {
	private _value: Awaited<ReturnType<typeof startAndConnectCount>>

	constructor() {
		this._value = uninitializedContext
	}

	public get value(): Awaited<ReturnType<typeof startAndConnectCount>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}
	public set value(v: Awaited<ReturnType<typeof startAndConnectCount>>) {
		this._value = v
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const fourParticipants: [TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle, TicTacWoahUserHandle] = [
		"Game A player 0",
		"Game A player 1",
		"Game B player 0",
		"Game B player 1",
	]
	const alwaysWinningGame = new Game([""], 10, 10, [anyMoveIsAllowed], [gameIsWonOnMoveNumber(1)])
	const anythingGoesGame = new Game([], 10, 10, [anyMoveIsAllowed], [])

	const winningMove = {
		mover: fourParticipants[0],
		placement: {
			x: faker.number.int(),
			y: faker.number.int(),
		},
	}

	const testContext = new GetTestContext()

	beforeAll(async () => {
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

		testContext.value = await startAndConnectCount(4, preConfigure)

		await testContext.value.clientSockets[0].emitWithAck("joinQueue", {})
		await testContext.value.clientSockets[1].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		await testContext.value.clientSockets[2].emitWithAck("joinQueue", {})
		await testContext.value.clientSockets[3].emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSockets[0].events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSockets[1].events.get("gameStart")).toHaveLength(1)
		})

		testContext.value.clientSockets[0].emit("makeMove", {
			...winningMove,
			gameId: testContext.value.clientSockets[0].events.get("gameStart")[0].id,
		})

		return testContext.value.done
	})

	it.each([0, 1])("Sends the winning move to participant %s", async clientIndex => {
		await vi.waitFor(() =>
			expect(testContext.value.clientSockets[clientIndex].events.get("gameWin")).toHaveLength(1)
		)
	})

	it.each([2, 3])("Does not send the winning move to the unrelated participant %s", async clientIndex => {
		await vi.waitFor(() =>
			expect(testContext.value.clientSockets[clientIndex].events.get("gameWin")).toHaveLength(0)
		)
	})
})
