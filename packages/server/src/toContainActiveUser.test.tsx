import { ActiveUser } from "TicTacWoahSocketServer"
import { Socket } from "socket.io"
import { test, expect } from "vitest"

test("Array contains user", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "456",
			connections: new Set(),
		},
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
	]

	expect(received).toContainActiveUser(a)
})

test("Array contains user with socket ids", () => {
	const connectionIds = ["ABC123", "DEF456", "GHI789"]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "456",
			connections: new Set(),
		},
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds.map(id => ({ id } as Socket))),
		},
	]

	expect(received).toContainActiveUser({
		uniqueIdentifier: "123",
		connections: new Set(connectionIds.map(id => ({ id } as Socket))),
	})
})

test("Array does not contain user", () => {
	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "456",
			connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id } as Socket))),
		},
	]

	expect(received).not.toContainActiveUser({
		uniqueIdentifier: "123",
		connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id } as Socket))),
	})
})

test("Array does not contain user by uniqueidentifier", () => {
	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
	]

	expect(received).not.toContainActiveUser({
		uniqueIdentifier: "1",
		connections: new Set(),
	})
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

	expect([a]).toContainActiveUser(b)
})
