import { ReturnSingleGameFactory } from "GameFactory"
import { MatchmakingBroker } from "MatchmakingBroker"
import { TicTacWoahUserHandle, TicTacWoahSocketServer, TicTacWoahRemoteServerSocket } from "TicTacWoahSocketServer"
import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { Game } from "domain/Game"
import { anyMoveIsAllowed } from "domain/gameRules/gameRules"
import { matchmaking, startGameOnMatchMade } from "matchmaking/matchmaking"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { startAndConnect } from "ticTacWoahTest"
import { vi, expect, beforeAll, describe, it } from "vitest"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

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
				.use(matchmaking(queue, matchmakingBroker))
				.use(
					startGameOnMatchMade(
						matchmakingBroker,
						new ReturnSingleGameFactory(new Game([], 10, 10, [anyMoveIsAllowed], []))
					)
				)
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
