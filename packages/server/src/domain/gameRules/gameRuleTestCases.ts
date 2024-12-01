import { PlacementSpecification, createParticipants } from "../gameTestHelpers"
import { Move } from "../Move"
import { Participant } from "../Participant"
import {
	GameRuleFunction,
	moveMustBeMadeByTheCorrectPlayer,
	moveMustBeWithinTheBoard,
	moveMustBeMadeIntoAFreeSquare,
} from "./gameRules"

export interface GameRuleTestCase {
	readonly rule: GameRuleFunction
	readonly move: Move
	readonly board: PlacementSpecification
	readonly participants: readonly Participant[]
	readonly expectedRuleResult: boolean
	readonly boardSize: number
}

const [p1, p2, p3] = createParticipants(3)

export const moveOrderTestCases: GameRuleTestCase[] = [
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 1, y: 1 }, mover: p1 },
		board: [
			[p1, "", ""],
			["", "", ""],
			["", "", ""],
		],
		participants: [p1, p2],
		expectedRuleResult: false,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 1, y: 0 }, mover: p2 },
		board: [
			[p1, ""],
			["", p2],
		],
		participants: [p1, p2],
		expectedRuleResult: false,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 2, y: 0 }, mover: p2 },
		board: [
			[p1, "", ""],
			["", p2, ""],
			["", "", p3],
		],
		participants: [p1, p2, p3],
		expectedRuleResult: false,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 0, y: 0 }, mover: p2 },
		board: [
			["", "", ""],
			["", "", ""],
			["", "", ""],
		],
		participants: [p1, p2],
		expectedRuleResult: false,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 0, y: 0 }, mover: p1 },
		board: [
			["", "", ""],
			["", "", ""],
			["", "", ""],
		],
		participants: [p1, p2],
		expectedRuleResult: true,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 2, y: 2 }, mover: p2 },
		board: [
			["", "", ""],
			["", p1, ""],
			["", "", ""],
		],
		participants: [p1, p2],
		expectedRuleResult: true,
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeByTheCorrectPlayer,
		move: { placement: { x: 1, y: 1 }, mover: p2 },
		board: [
			[p1, "", p2],
			["", "", ""],
			["", "", p1],
		],
		participants: [p1, p2],
		expectedRuleResult: true,
		boardSize: 100,
	},
]

export const moveBoundsTestCases: GameRuleTestCase[] = [
	{
		rule: moveMustBeWithinTheBoard,
		move: { placement: { x: 1, y: 1 }, mover: p2 },
		board: [
			[p1, "", p2],
			["", "", ""],
			["", "", p1],
		],
		participants: [p1, p2],
		expectedRuleResult: true,
		boardSize: 20,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: -1, y: 0 }, mover: p1 },
		boardSize: 20,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 0, y: -1 }, mover: p1 },
		boardSize: 20,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: -9, y: -7 }, mover: p1 },
		boardSize: 20,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 0, y: -7 }, mover: p1 },
		boardSize: 20,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 100, y: 0 }, mover: p1 },
		boardSize: 100,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 100 }, mover: p2 },
		boardSize: 100,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 100 }, mover: p2 },
		boardSize: 100,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: true,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 99 }, mover: p1 },
		boardSize: 100,
	},
	{
		rule: moveMustBeWithinTheBoard,
		board: [],
		expectedRuleResult: true,
		participants: [p1, p2],
		move: { placement: { x: 99, y: 99 }, mover: p1 },
		boardSize: 100,
	},
]

export const moveMustBeMadeIntoAFreeSquareTestCases: GameRuleTestCase[] = [
	{
		rule: moveMustBeMadeIntoAFreeSquare,
		board: [
			["", "", ""],
			["", "", ""],
			["", "", ""],
		],
		expectedRuleResult: true,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 0 }, mover: p1 },
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeIntoAFreeSquare,
		board: [
			[p1, "", ""],
			["", "", ""],
			["", "", ""],
		],
		expectedRuleResult: false,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 0 }, mover: p1 },
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeIntoAFreeSquare,
		board: [
			["", "", ""],
			["", p1, ""],
			["", "", ""],
		],
		expectedRuleResult: true,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 0 }, mover: p2 },
		boardSize: 100,
	},
	{
		rule: moveMustBeMadeIntoAFreeSquare,
		board: [
			["", "", ""],
			["", p1, ""],
			["", "", ""],
		],
		expectedRuleResult: true,
		participants: [p1, p2],
		move: { placement: { x: 0, y: 0 }, mover: p2 },
		boardSize: 100,
	},
]
