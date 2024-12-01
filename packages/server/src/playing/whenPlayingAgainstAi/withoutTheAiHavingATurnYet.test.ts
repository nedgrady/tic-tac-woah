import { expect, beforeAll, describe, it, vi } from "vitest"
import _ from "lodash"
import { Coordinates } from "../.."
import { MakeSequenceOfMoves } from "../../aiAgents/support/MakeSequenceOfMoves"
import { identifyAllSocketsAsTheSameUser } from "../../auth/socketIdentificationStrategies"
import { matchmaking } from "../../matchmaking/matchmaking"
import { MatchmakingBroker } from "../../matchmaking/MatchmakingBroker"
import { MatchmakingStrategy, MadeMatch } from "../../matchmaking/MatchmakingStrategy"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "../../queue/addConnectionToQueue"
import { madeMatchRulesFactory, joinQueueRequestFactory } from "../../testingUtilities/factories"
import { StartAndConnectLifetime } from "../../testingUtilities/serverSetup/ticTacWoahTest"
import { TicTacWoahSocketServer } from "../../TicTacWoahSocketServer"
import { startGameOnMatchMade } from "../startGameOnMatchMade"
import { ReturnSingleGameFactory } from "../support/ReturnSingleGameFactory"

class AlwaysMatchVsSingleAiOpponent extends MatchmakingStrategy {
	constructor(private aiMoves: readonly Coordinates[] = []) {
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

	const preConfigure = (server: TicTacWoahSocketServer) => {
		server
			.use(
				identifyAllSocketsAsTheSameUser({
					connections: new Set(),
					uniqueIdentifier: "Human Player",
				}),
			)
			.use(addConnectionToQueue(queue))
			.use(matchmaking(queue, matchmakingBroker, new AlwaysMatchVsSingleAiOpponent()))
			.use(
				startGameOnMatchMade(
					matchmakingBroker,
					new ReturnSingleGameFactory({
						decideWhoMayMoveNext: () => [],
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

	it("No moves are made by the ai", async () => {
		expect(testContext.clientSocket).not.toHaveReceivedEvent("moveMade")
	})
})
