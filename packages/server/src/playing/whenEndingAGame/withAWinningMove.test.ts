import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { GameWinDto, MoveDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"
import { Game } from "domain/Game"
import { ReturnSingleGameFactory } from "GameFactory"
import { Participant } from "domain/Participant"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { gameIsWonOnMoveNumber } from "domain/winConditions/winConditions"
import { Move } from "domain/Move"

const uninitializedContext = {} as Awaited<ReturnType<typeof startAndConnect>>

class GetTestContext {
	private _value: Awaited<ReturnType<typeof startAndConnect>>

	constructor() {
		this._value = uninitializedContext
	}

	public get value(): Awaited<ReturnType<typeof startAndConnect>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}
	public set value(v: Awaited<ReturnType<typeof startAndConnect>>) {
		this._value = v
	}
}

describe.only("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

	const alwaysWinningGame = new Game([new Participant()], 10, 10, [anyMoveIsAllowed], [gameIsWonOnMoveNumber(1)])

	const winningMove = {
		mover: twoUsers[0],
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
						twoUsers.map(handle => ({
							connections: new Set(),
							uniqueIdentifier: handle,
						}))
					)
				)
				.use(addConnectionToQueue(queue))
				.use(matchmaking(queue, matchmakingBroker))
				.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory(alwaysWinningGame)))

			// TODO - what middleware to add?
		}

		testContext.value = await startAndConnect(preConfigure)

		await testContext.value.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.value.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.value.clientSocket2.events.get("gameStart")).toHaveLength(1)
			expect(testContext.value.clientSocket.events.get("gameStart")).toHaveLength(1)
		})

		testContext.value.clientSocket.emit("makeMove", {
			...winningMove,
			gameId: testContext.value.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.value.done
	})

	it("Sends the winning move to participant 1", async () => {
		await vi.waitFor(() => expect(testContext.value.clientSocket.events.get("gameWin")).toHaveLength(1))
	})

	it("Sends the winning move to participant 2", async () => {
		await vi.waitFor(() => expect(testContext.value.clientSocket2.events.get("gameWin")).toHaveLength(1))
	})

	it("Sends the correct move information to participant 1", async () => {
		const gameWin = testContext.value.clientSocket.events.get("gameWin")[0]
		const expectedGameWin: GameWinDto = {
			winningMoves: [
				{
					mover: winningMove.mover,
					placement: winningMove.placement,
					gameId: testContext.value.clientSocket.events.get("gameStart")[0].id,
				},
			],
		}
		expect(gameWin).toMatchObject(expectedGameWin)
	})
})
