import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it, test } from "vitest"
import { faker } from "@faker-js/faker"
import { GameStartDto } from "types"
import { MatchmakingBroker } from "MatchmakingBroker"

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

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

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
				.use(startGameOnMatchMade(matchmakingBroker))
		}

		testContext.value = await startAndConnect(preConfigure)

		await testContext.value.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.value.clientSocket.emitWithAck("joinQueue", {})

		return testContext.value.done
	})

	it("Clears the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})

	it("Game start is sent to the first player", () => {
		expect(testContext.value.serverSocket.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
			id: expect.any(String),
			players: expect.arrayContaining(twoUsers),
		})
	})

	it("Game start is sent to the second player", () => {
		expect(testContext.value.serverSocket2.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
			id: expect.any(String),
			players: expect.arrayContaining(twoUsers),
		})
	})

	it("The game id is the same for both players", () => {
		const gameId1 = testContext.value.clientSocket.events.get("gameStart")[0].id
		const gameId2 = testContext.value.clientSocket2.events.get("gameStart")[0].id

		expect(gameId1).toEqual(gameId2)
	})
})
