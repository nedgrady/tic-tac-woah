import { identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { ticTacWoahTest } from "ticTacWoahTest"
import { vi, expect } from "vitest"
import { TicTacWoahSocketServer, TicTacWoahUserHandle } from "TicTacWoahSocketServer"
import { faker } from "@faker-js/faker"
import { GameStartDto } from "types"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { matchmaking } from "./matchmaking"

ticTacWoahTest(
	"With a game size of 2, two users joining the queue are matched into a game",
	async ({ setup: { startAndConnect } }) => {
		const queue = new TicTacWoahQueue()
		const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = [faker.string.uuid(), faker.string.uuid()]

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

		const { clientSocket, clientSocket2, serverSocket, serverSocket2 } = await startAndConnect(preConfigure)

		await clientSocket.emitWithAck("joinQueue", {})
		await clientSocket2.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(serverSocket.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
				id: expect.any(String),
				players: twoUsers,
			})
			expect(serverSocket2.emit).toHaveBeenCalledWith<["gameStart", GameStartDto]>("gameStart", {
				id: expect.any(String),
				players: twoUsers,
			})

			expect(queue.users).toHaveLength(0)
		})
	}
)

ticTacWoahTest("All active clients are notified of the game start", async ({ setup: { startAndConnectCount } }) => {
	const queue = new TicTacWoahQueue()
	const twoUsers: [TicTacWoahUserHandle, TicTacWoahUserHandle] = ["User A", "User B"]

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

	const { serverSockets, clientSockets } = await startAndConnectCount(4, preConfigure)

	clientSockets.forEach(socket => socket.emitWithAck("joinQueue", {}))

	await vi.waitFor(() => {
		serverSockets.forEach((serverSocket, socketIndex) => {
			expect(serverSocket.emit, `socket index ${socketIndex}`).toHaveBeenCalledWith<["gameStart", GameStartDto]>(
				"gameStart",
				{
					id: expect.any(String),
					players: twoUsers,
				}
			)
		})
	})
})
