import { TicTacWoahUserHandle, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { expect, beforeAll, describe, it } from "vitest"
import { GameStartDtoSchema } from "types"

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
})
