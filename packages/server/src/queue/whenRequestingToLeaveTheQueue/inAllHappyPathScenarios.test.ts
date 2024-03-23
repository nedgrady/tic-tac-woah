import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { removeConnectionFromQueueWhenRequested } from "../removeConnectionFromQueueWhenRequested"

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

class StartAndConnectLifetime {
	private _value: Awaited<ReturnType<typeof startAndConnect>>
	private _args: Parameters<typeof startAndConnect>

	constructor(...args: Parameters<typeof startAndConnect>) {
		this._value = uninitializedContext
		this._args = args
	}

	public get value(): Awaited<ReturnType<typeof startAndConnect>> {
		if (this._value === uninitializedContext) throw new Error("Test context not initialized")

		return this._value
	}
	public set value(v: Awaited<ReturnType<typeof startAndConnect>>) {
		this._value = v
	}

	async start() {
		this._value = await startAndConnect(...this._args)
	}

	public get done() {
		return this._value.done
	}

	public get clientSocket() {
		return this._value.clientSocket
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifyAllSocketsAsTheSameUser())
			.use(removeConnectionFromQueueWhenRequested(queue))
			.use(addConnectionToQueue(queue))
	}

	const testLifetime = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testLifetime.start()

		await testLifetime.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		testLifetime.clientSocket.emit("leaveQueue")

		return testLifetime.done
	})

	it("removes the user from the queue", async () => {
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(0)
		})
	})
})
