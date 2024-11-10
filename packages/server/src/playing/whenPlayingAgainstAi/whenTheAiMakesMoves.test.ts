import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { coorinatesFactory, joinQueueRequestFactory, madeMatchRulesFactory } from "testingUtilities/factories"
import { MadeMatch, MatchmakingStrategy } from "matchmaking/MatchmakingStrategy"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"
import _ from "lodash"
import Coordinates from "domain/Coordinates"
import { MakeSequenceOfMoves } from "aiAgents/support/MakeSequenceOfMoves"

class AlwaysMatchVsSingleAiOpponent extends MatchmakingStrategy {
	constructor(private aiMoves: readonly Coordinates[]) {
		super()
	}

	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		return [
			{
				aiParticipants: [new MakeSequenceOfMoves(this.aiMoves, "AI")],
				participants: [queueItems[0].queuer],
				rules: madeMatchRulesFactory.build(),
			},
		]
	}
}

describe("it", () => {
	const queue = new TicTacWoahQueue()
	const matchmakingBroker = new MatchmakingBroker()

	const aiMoves = coorinatesFactory.buildList(3)

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifyAllSocketsAsTheSameUser({
					connections: new Set(),
					uniqueIdentifier: "Human Player",
				}),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchVsSingleAiOpponent(aiMoves)))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({
						decideWhoMayMoveNext: gameState => [gameState.moves.length < 3 ? "AI" : "Human Player"],
					}),
				),
			)
	}

	const testContext = new StartAndConnectLifetime(preConfigure)

	beforeAll(async () => {
		await testContext.start()

		testContext.clientSocket.emit("joinQueue", joinQueueRequestFactory.build())

		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedEvent("gameStart")
		})

		return testContext.done
	})

	it.each(aiMoves)("The move '%s' is received", async aiMove => {
		await vi.waitFor(() => {
			expect(testContext.clientSocket).toHaveReceivedPayload("moveMade", {
				mover: "AI",
				gameId: expect.any(String),
				placement: aiMove,
			})
		})
	})
})
