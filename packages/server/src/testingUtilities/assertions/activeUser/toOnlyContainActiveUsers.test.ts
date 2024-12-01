import { Socket } from "socket.io"
import { test, expect } from "vitest"
import { ActiveUser } from "../../../TicTacWoahSocketServer"

test("Array contains only specified users", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(),
		},
	]

	expect(received).toOnlyContainActiveUsers(...users)
})

test("Array contains only specified users with socket ids", () => {
	const connectionIds1 = ["ABC123", "DEF456", "GHI789"]
	const connectionIds2 = ["HIJ123", "KLM111", "CBA823"]

	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds1.map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(connectionIds2.map(id => ({ id }) as Socket)),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(connectionIds1.map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(connectionIds2.map(id => ({ id }) as Socket)),
		},
	]

	expect(received).toOnlyContainActiveUsers(...users)
})

test("Array contains extra users", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id }) as Socket)),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123", "DEF456", "GHI789"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["HIJ123", "KLM111", "CBA823"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "789",
			connections: new Set(["XYZ123", "XYZ456", "XYZ789"].map(id => ({ id }) as Socket)),
		},
	]

	expect(received).not.toOnlyContainActiveUsers(...users)
})

test("Array does not contain all specified users", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "1",
			connections: new Set(),
		},
		{
			uniqueIdentifier: "2",
			connections: new Set(),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "1",
			connections: new Set(),
		},
	]

	expect(received).not.toOnlyContainActiveUsers(...users)
})

test("Array contains only specified users, ignoring extra socket properties", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["DEF456"].map(id => ({ id }) as Socket)),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123"].map(id => ({ id, extraPropertyToIgnore: "ignore" }) as unknown as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["DEF456"].map(id => ({ id, extraPropertyToIgnore: "me" }) as unknown as Socket)),
		},
	]

	expect(received).toOnlyContainActiveUsers(...users)
})

test("Array contains extra users, ignoring extra socket properties", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123"].map(id => ({ id }) as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["DEF456"].map(id => ({ id }) as Socket)),
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(["ABC123"].map(id => ({ id, extraPropertyToIgnore: "ignore" }) as unknown as Socket)),
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(["DEF456"].map(id => ({ id, extraPropertyToIgnore: "me" }) as unknown as Socket)),
		},
		{
			uniqueIdentifier: "789",
			connections: new Set(
				["GHI789"].map(id => ({ id, extraPropertyToIgnore: "different" }) as unknown as Socket),
			),
		},
	]

	expect(received).not.toOnlyContainActiveUsers(...users)
})

test("Array contains only specified users ignoring activeUser properties", () => {
	const users: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
			objectId: "123",
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(),
			objectId: "456",
		},
	]

	const received: ActiveUser[] = [
		{
			uniqueIdentifier: "123",
			connections: new Set(),
			objectId: "789",
		},
		{
			uniqueIdentifier: "456",
			connections: new Set(),
			objectId: "101112",
		},
	]

	expect(received).toOnlyContainActiveUsers(...users)
})
