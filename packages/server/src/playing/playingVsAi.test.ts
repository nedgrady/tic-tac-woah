import { TicTacWoahSocketServer } from "TicTacWoahSocketServer"
import { identifyAllSocketsAsTheSameUser } from "auth/socketIdentificationStrategies"
import { matchmaking } from "matchmaking/matchmaking"
import { startGameOnMatchMade } from "playing/startGameOnMatchMade"
import { QueueItem, TicTacWoahQueue, addConnectionToQueue } from "queue/addConnectionToQueue"
import { StartAndConnectLifetime } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect, beforeAll, describe, it, vi } from "vitest"
import { MatchmakingBroker } from "matchmaking/MatchmakingBroker"
import { joinQueueRequestFactory, madeMatchRulesFactory } from "testingUtilities/factories"
import { MadeMatch, MatchmakingStrategy } from "matchmaking/MatchmakingStrategy"
import { ReturnSingleGameFactory } from "./support/ReturnSingleGameFactory"
import _ from "lodash"

class AlwaysMatchVsSingleAiOpponent extends MatchmakingStrategy {
	doTheThing(queueItems: readonly QueueItem[]): readonly MadeMatch[] {
		return [
			{
				aiCount: 1,
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
						decideWhoMayMoveNext: thing =>
							thing.moves.length < 1
								? [thing.participants.find(participant => participant !== "Human Player")!]
								: [],
						participants: ["Human Player", "AI"],
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

	it("The move is sent to the first player", async () => {
		await vi.waitFor(() => expect(testContext.clientSocket).toHaveReceivedEvent("moveMade"))
	})
	// it("The move is sent to the second player", async () => {
	// 	await vi.waitFor(() =>
	// 		expect(testContext.clientSocket2).toHaveReceivedPayload("moveMade", {
	// 			...fistMove,
	// 			mover: testContext.clientSocket.id,
	// 			gameId: testContext.clientSocket.events.get("gameStart")[0].id,
	// 		}),
	// 	)
	// })

	// it("First player does not receive a win event", async () => {
	// 	expect(testContext.clientSocket).not.toHaveReceivedEvent("gameWin")
	// })

	// it("Second player does not receive a win event", async () => {
	// 	expect(testContext.clientSocket2).not.toHaveReceivedEvent("gameWin")
	// })
})
