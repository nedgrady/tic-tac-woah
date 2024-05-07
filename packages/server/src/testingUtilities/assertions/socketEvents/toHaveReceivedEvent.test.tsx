import { gameStartDtoFactory } from "testingUtilities/factories"
import { AssertableTicTacWoahClientSocket } from "testingUtilities/serverSetup/ticTacWoahTest"
import { StrongMap } from "utilities/StrongMap"
import { expect, test } from "vitest"

test("No events works", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveReceivedEvent("gameStart")
})

test("Some events works", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	mockEvents.add("gameStart", gameStartDtoFactory.build())

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedEvent("gameStart")
})
