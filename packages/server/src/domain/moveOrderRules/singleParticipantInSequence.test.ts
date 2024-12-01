import { faker } from "@faker-js/faker"
import { expect, test } from "vitest"
import { GameState } from "../gameRules/gameRules"
import { singleParticipantInSequence } from "./singleParticipantInSequence"

test("Single participant in sequence returns the first participant after no moves", () => {
	const p1 = faker.string.uuid()
	const firstParticipantToMove: GameState = {
		moves: [],
		participants: [p1],
	}
	expect(singleParticipantInSequence(firstParticipantToMove)).toEqual([p1])
})

test("Single participant in sequence returns the second participant after one move", () => {
	const p1 = faker.string.uuid()
	const p2 = faker.string.uuid()
	const secondParticipantToMove: GameState = {
		moves: [
			{
				mover: p1,
				placement: {
					x: 0,
					y: 0,
				},
			},
		],
		participants: [p1, p2],
	}
	expect(singleParticipantInSequence(secondParticipantToMove)).toEqual([p2])
})

test("Single participant in sequence restarts after all players have moved", () => {
	const p1 = faker.string.uuid()
	const p2 = faker.string.uuid()
	const secondParticipantToMove: GameState = {
		moves: [
			{
				mover: p1,
				placement: {
					x: 0,
					y: 0,
				},
			},
			{
				mover: p2,
				placement: {
					x: 1,
					y: 1,
				},
			},
		],
		participants: [p1, p2],
	}
	expect(singleParticipantInSequence(secondParticipantToMove)).toEqual([p1])
})
