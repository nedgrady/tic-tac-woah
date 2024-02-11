import { TicTacWoahUserHandle, TicTacWoahSocketServer, TicTacWoahRemoteServerSocket } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User 1", "User 2"]
	let socketInQueue: TicTacWoahRemoteServerSocket

	beforeAll(async () => {
		const { serverSocket, clientSocket, done } = await startAndConnect((server: TicTacWoahSocketServer) => {
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
		})

		await clientSocket.emitWithAck("joinQueue", {})
		await vi.waitFor(() => {
			expect(queue.users).toHaveLength(1)
		})

		socketInQueue = serverSocket

		return done
	})

	it("does not create a game", () => {
		expect(socketInQueue.emit).not.toHaveBeenCalled()
	})
})
