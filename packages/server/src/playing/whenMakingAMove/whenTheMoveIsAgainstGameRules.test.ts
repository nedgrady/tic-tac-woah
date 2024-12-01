import { PendingMoveDto } from "@tic-tac-woah/types"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { identifySocketsByWebSocketId } from "../../auth/socketIdentificationStrategies"
import { noMoveIsAllowed } from "../../domain/gameRules/support/noMoveIsAllowed"
import { matchmaking } from "../../matchmaking/matchmaking"
import { MatchmakingBroker } from "../../matchmaking/MatchmakingBroker"
import { AlwaysMatchFirstTwoParticipants } from "../../matchmaking/support/AlwaysMatchFirstTwoParticipants"
import { TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { startGameOnMatchMade } from "../startGameOnMatchMade"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(identifySocketsByWebSocketId)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchFirstTwoParticipants()))
			.use(startGameOnMatchMade(matchmakingBroker, new ReturnSingleGameFactory({ rules: [noMoveIsAllowed] })))
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())
		testContext.clientSocket2.emit("joinQueue", joinQueueRequestFactory.build())

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
