import { ActiveUser } from "TicTacWoahSocketServer"
import { Socket } from "socket.io"
import { expect, test } from "vitest"
test("Array contains single user", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
	]

	expect(received).toContainSingleActiveUser(a)
})

test("Array contains single user with socket ids", () => {
	const connectionIds = ["ABC123", "DEF456", "GHI789"]

	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(connectionIds.map(id => ({ id } as Socket))),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds.map(id => ({ id } as Socket))),
		},
	]

	expect(received).toContainSingleActiveUser(a)
})

test("Array contains multiple users", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id } as Socket))),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id } as Socket))),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id } as Socket))),
		},
	]

	expect(received).not.toContainSingleActiveUser(a)
})

test("Array contains different user", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "1",
		connections: new Set(),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
	]

	expect(received).not.toContainSingleActiveUser(a)
})
