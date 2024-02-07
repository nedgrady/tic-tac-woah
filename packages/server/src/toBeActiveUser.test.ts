import { ActiveUser } from "TicTacWoahSocketServer"
import { Socket } from "socket.io"
import { test, expect } from "vitest"

test("Same user", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	const b: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	expect(a).toBeActiveUser(b)
})

test("Same user with socket ids", () => {
	const connectionIds = ["ABC123", "DEF456", "GHI789"]

	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(connectionIds.map(id => ({ id } as Socket))),
	}

	const b: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(connectionIds.map(id => ({ id } as Socket))),
	}

	expect(a).toBeActiveUser(b)
})

test("Differnt user by socket ids", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id } as Socket))),
	}

	const b: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id } as Socket))),
	}

	expect(a).not.toBeActiveUser(b)
})

test("Not same by uniqueidentifier", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "1",
		connections: new Set(),
	}

	const b: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	expect(a).not.toBeActiveUser(b)
})

test("Other properties on the Socket are ignored", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	const b: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	a.connections.add({ id: "123", someOtherProperty: "Something" } as unknown as Socket)
	b.connections.add({ id: "123", someOtherProperty: "Different" } as unknown as Socket)

	expect(a).toBeActiveUser(b)
})
