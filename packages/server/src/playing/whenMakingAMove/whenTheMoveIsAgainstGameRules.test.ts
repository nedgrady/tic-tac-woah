import { ActiveUser, TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifySocketsByWebSocketId, identifySocketsInSequence } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { faker } from "@faker-js/faker"
import { MatchmakingBroker } from "MatchmakingBroker"
import { ReturnSingleGameFactory } from "GameFactory"
import { Game } from "domain/Game"
import { noMoveIsAllowed } from "domain/gameRules/support/noMoveIsAllowed"
import { anyParticipantMayMoveNext } from "domain/moveOrderRules/support/anyParticipantMayMoveNext"
import { PendingMoveDto } from "types"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const allMovesAreInvalidGame = new Game([""], 10, 10, [noMoveIsAllowed], [], [], anyParticipantMayMoveNext)

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker))
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory(allMovesAreInvalidGame)))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		await testContext.clientSocket2.emitWithAck("joinQueue", {})
		await testContext.clientSocket.emitWithAck("joinQueue", {})

		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedEvent("gameStart")
			expect(testContext.clientSocket2).toHaveReceivedEvent("gameStart")
		})

		const moveAgainstGameRules: PendingMoveDto = {
			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
			placement: { x: 0, y: 0 },
		}

		await testContext.clientSocket.emitWithAck("makeMove", moveAgainstGameRules)

		return testContext.done
	})

	it("The move is rejected and not sent to player one", async () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("moveMade")
	})
	it("The move is rejected and not sent to player two", async () => {
		expect(testContext.clientSocket2).not.toHaveReceivedEvent("moveMade")
	})
})
