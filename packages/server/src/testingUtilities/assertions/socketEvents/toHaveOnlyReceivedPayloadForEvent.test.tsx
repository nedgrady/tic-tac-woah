import { gameStartDtoFactory } from "testingUtilities/factories"
import { AssertableTicTacWoahClientSocket } from "testingUtilities/serverSetup/ticTacWoahTest"
import { GameStartDto } from "@tic-tac-woah/types"
import { StrongMap } from "utilities/StrongMap"
import { expect, test } from "vitest"

test("Some payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	const gameStartPayload: GameStartDto = gameStartDtoFactory.build()
	mockEvents.add("gameStart", gameStartPayload)

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveOnlyReceivedPayloadForEvent("gameStart", { ...gameStartPayload })
})

test("Extra payloads are detected", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	const gameStartPayload: GameStartDto = gameStartDtoFactory.build()
	const otherGameStartPayload: GameStartDto = gameStartDtoFactory.build()
	mockEvents.add("gameStart", gameStartPayload)
	mockEvents.add("gameStart", otherGameStartPayload)

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	const shouldThrow = () => {
		expect(client).toHaveOnlyReceivedPayloadForEvent("gameStart", { ...gameStartPayload })
	}

	expect(shouldThrow).toThrow()
})

test("Extra payloads are detected negative", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	const gameStartPayload: GameStartDto = gameStartDtoFactory.build()
	const otherGameStartPayload: GameStartDto = gameStartDtoFactory.build()
	mockEvents.add("gameStart", gameStartPayload)
	mockEvents.add("gameStart", otherGameStartPayload)

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveOnlyReceivedPayloadForEvent("gameStart", { ...gameStartPayload })
})

test("No payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveOnlyReceivedPayloadForEvent("gameStart", gameStartDtoFactory.build())
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

	expect(client).toHaveOnlyReceivedPayloadForEvent(
		"gameStart",
		expect.objectContaining<Partial<GameStartDto>>({ id: "123" }),
	)
})
