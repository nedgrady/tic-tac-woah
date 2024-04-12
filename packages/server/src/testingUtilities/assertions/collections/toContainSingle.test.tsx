import { expect, test } from "vitest"

test("single object in array matches exactly", () => {
	expect([{ a: 1 }]).toContainSingle({ a: 1 })
})

test("single object in array matches partially", () => {
	expect([{ a: 1, b: 3 }]).toContainSingle(expect.objectContaining({ a: 1 }))
})

test("single number in array matches", () => {
	expect([1]).toContainSingle(1)
})

test("empty array does not contain number", () => {
	expect([]).not.toContainSingle(1)
})
