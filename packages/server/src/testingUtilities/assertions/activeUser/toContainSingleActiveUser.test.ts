import { ActiveUser, TicTacWoahServerSocket } from "TicTacWoahSocketServer"
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
		connections: new Set(connectionIds.map(id => ({ id, data: 1 }) as TicTacWoahServerSocket)),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds.map(id => ({ id, data: 2 }) as TicTacWoahServerSocket)),
		},
	]

	expect(received).toContainSingleActiveUser(a)
})

test("Array contains single user with other properties on the connections", () => {
	const connectionIds = ["ABC123", "DEF456", "GHI789"]

	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(connectionIds.map<TicTacWoahServerSocket>(id => ({ id }) as TicTacWoahServerSocket)),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds.map(id => ({ id }) as TicTacWoahServerSocket)),
		},
	]

	expect(received).toContainSingleActiveUser(a)
})

test("Array contains multiple users", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id }) as Socket)),
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id }) as Socket)),
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

test("Array contains single user with differing activeUser properties", () => {
	const a: ActiveUser = {
		uniqueIdentifier: "123",
		connections: new Set(),
		objectId: "Some object id",
	}

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
			objectId: "Some other object id",
		},
	]

	expect(received).toContainSingleActiveUser(a)
})
