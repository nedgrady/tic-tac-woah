import { GameStartDto } from "@tic-tac-woah/types"
import { expect, test } from "vitest"
import { StrongMap } from "../../../utilities/StrongMap"
import { gameStartDtoFactory } from "../../factories"
import { AssertableTicTacWoahClientSocket } from "../../serverSetup/ticTacWoahTest"

test("Some payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	const gameStartPayload: GameStartDto = gameStartDtoFactory.build()
	mockEvents.add("gameStart", gameStartPayload)

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedPayload("gameStart", { ...gameStartPayload })
})

test("No payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveReceivedPayload("gameStart", gameStartDtoFactory.build())
})

test("Object Matching with payloads", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	const gameStartPayload: GameStartDto = gameStartDtoFactory.build({
		id: "123",
	})

	mockEvents.add("gameStart", gameStartPayload)

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedPayload("gameStart", expect.objectContaining<Partial<GameStartDto>>({ id: "123" }))
})
