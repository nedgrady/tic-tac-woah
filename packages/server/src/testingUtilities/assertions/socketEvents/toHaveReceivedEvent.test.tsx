import { TicTacWoahEventMap, TicTacWoahEventName } from "TicTacWoahSocketServer"
import { AssertableTicTacWoahClientSocket } from "testingUtilities/serverSetup/ticTacWoahTest"
import { GameStartDto } from "types"
import { StrongMap } from "utilities/StrongMap"
import { expect, test, vi } from "vitest"

test("No events works", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveReceivedEvent("gameStart")
})

test("Some events works", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	mockEvents.add("gameStart", { id: "123", players: ["123", "456"] })

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedEvent("gameStart")
})
