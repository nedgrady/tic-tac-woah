import { TicTacWoahEventMap, TicTacWoahEventName } from "TicTacWoahSocketServer"
import { AssertableTicTacWoahClientSocket } from "ticTacWoahTest"
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

test("Some payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	mockEvents.add("gameStart", { id: "123", players: ["123", "456"] })

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedPayload("gameStart", { id: "123", players: ["123", "456"] })
})

test("No payloads work", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).not.toHaveReceivedPayload("gameStart", { id: "123", players: ["123", "456"] })
})

test("Object Matching with payloads", () => {
	const mockEvents: AssertableTicTacWoahClientSocket["events"] = new StrongMap()
	mockEvents.add("gameStart", { id: "123", players: ["123", "456"] })

	const client: AssertableTicTacWoahClientSocket = {
		events: mockEvents,
	} as unknown as AssertableTicTacWoahClientSocket

	expect(client).toHaveReceivedPayload("gameStart", expect.objectContaining<Partial<GameStartDto>>({ id: "123" }))
})
