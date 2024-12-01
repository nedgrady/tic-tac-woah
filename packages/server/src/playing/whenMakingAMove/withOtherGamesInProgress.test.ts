import { identifySocketsByWebSocketId } from "../../auth/socketIdentificationStrategies"
import { matchmaking } from "../../matchmaking/matchmaking"
import { MatchmakingBroker } from "../../matchmaking/MatchmakingBroker"
import { AlwaysMatchFirstTwoParticipants } from "../../matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { startGameOnMatchMade } from "../startGameOnMatchMade"
import { AnythingGoesForeverGameFactory } from "../support/AnythingGoesForeverGameFactory"
import { expect, beforeAll, describe, it, vi } from "vitest"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(startGameOnMatchMade(matchmakingBroker, new AnythingGoesForeverGameFactory()))
	}

	const testContext = new StartAndConnectLifetime(preConfigure, 4)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSockets[0].emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSockets[1].emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSockets[0]).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSockets[1]).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSockets[2].emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSockets[3].emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSockets[2]).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSockets[3]).toHaveReceivedEvent("gameStart")
		})

		testContext.clientSockets[0].emit("makeMove", {
			placement: {
				x: 0,
				y: 0,
			},
			gameId: testContext.clientSockets[0].events.get("gameStart")[0].id,
		})

		testContext.clientSockets[2].emit("makeMove", {
			placement: {
				x: 9,
				y: 9,
			},
			gameId: testContext.clientSockets[2].events.get("gameStart")[0].id,
		})

		return testContext.done
	})

	it.each([0, 1])("Game A player %s only receives the relevant move", async playerIndex => {
		await vi.waitFor(() => {
			expect(testContext.clientSockets[playerIndex]).toHaveReceivedPayload("moveMade", {
				mover: testContext.clientSockets[0].id,
				placement: {
					x: 0,
					y: 0,
				},
				gameId: testContext.clientSockets[playerIndex].events.get("gameStart")[0].id,
			})
		})
	})

	it.each([2, 3])("Game A player %s only receives the relevant move", async playerIndex => {
		await vi.waitFor(() => {
			expect(testContext.clientSockets[playerIndex]).toHaveReceivedPayload("moveMade", {
				mover: testContext.clientSockets[2].id,
				placement: {
					x: 9,
					y: 9,
				},
				gameId: testContext.clientSockets[playerIndex].events.get("gameStart")[0].id,
			})
		})
	})
})
