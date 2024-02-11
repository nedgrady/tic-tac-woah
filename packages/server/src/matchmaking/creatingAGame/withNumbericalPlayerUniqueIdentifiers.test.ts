import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect, ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it, test } from "vitest"
import { faker } from "@faker-js/faker"
import { GameStartDto, GameStartDtoSchema } from "types"

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
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["1", "2"]

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
				.use(matchmaking(queue))
		}

		testContext.value = await startAndConnect(preConfigure)

		await testContext.value.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.value.clientSocket.emitWithAck("joinQueue", {})

		return testContext.value.done
	})

	it("The response can be parsed by the GameStartDtoSchema", () => {
		// expect(testContext.value.serverSocket.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
		// 	id: expect.any(String),
		// 	players: expect.arrayContaining(twoUsers),
		// })

		const gameStartDto = testContext.value.clientSocket.events.get("gameStart")[0]

		console.log(gameStartDto)

		expect(() => GameStartDtoSchema.parse(gameStartDto)).not.toThrow()
	})

	// it("Game start is sent to the second player", () => {
	// 	expect(testContext.value.serverSocket2.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
	// 		id: expect.any(String),
	// 		players: expect.arrayContaining(twoUsers),
	// 	})
	// })
})
