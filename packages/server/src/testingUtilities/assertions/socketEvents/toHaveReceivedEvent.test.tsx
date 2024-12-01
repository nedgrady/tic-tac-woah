import { expect, test } from "vitest"
import { StrongMap } from "../../../utilities/StrongMap"
import { gameStartDtoFactory } from "../../factories"
import { AssertableTicTacWoahClientSocket } from "../../serverSetup/ticTacWoahTest"

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
