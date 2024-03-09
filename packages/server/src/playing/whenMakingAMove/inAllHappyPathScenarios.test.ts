import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MoveDto } from "types"
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

	const fistMove = {
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
				.use(startGameOnMatchMade(matchmakingBroker))
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
			...fistMove,
			gameId: testContext.value.clientSocket.events.get("gameStart")[0].id,
		})

		return testContext.value.done
	})

	it("The move is sent to the first player", async () => {
		await vi.waitFor(() =>
			expect(testContext.value.clientSocket.events.get("moveMade")).toContainEqual(
				expect.objectContaining<MoveDto>({
					...fistMove,
					gameId: testContext.value.clientSocket.events.get("gameStart")[0].id,
				})
			)
		)
	})
	it("The move is sent to the second player", async () => {
		await vi.waitFor(() =>
			expect(testContext.value.clientSocket2.events.get("moveMade")).toContainEqual(
				expect.objectContaining({
					...fistMove,
					gameId: testContext.value.clientSocket.events.get("gameStart")[0].id,
				})
			)
		)
	})
})
