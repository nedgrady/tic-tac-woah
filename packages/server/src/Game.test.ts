import { expect, it, vitest, describe, ArgumentsType } from "vitest"
import { Game, GameWonListener } from "./Game"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { faker } from "@faker-js/faker"
import _ from "lodash"
import { GameConfiguration, GameRuleFunction, standardRules } from "./gameRules"
import { GameWinCondition, standardWinConditions } from "./domain/winConditions/winConditions"
import { makeMoves } from "./domain/gameTestHelpers"

type GameTestDefinition = GameConfiguration & {
	participantCount?: number
	rules: readonly GameRuleFunction[]
	winConditions: readonly GameWinCondition[]
}

function gameWithParticipants({
	boardSize: gridSize = 20,
	consecutiveTarget = 4,
	participantCount = 3,
	rules = standardRules,
	winConditions = standardWinConditions,
}: Partial<GameTestDefinition> = {}) {
	const participants = Array.from({ length: participantCount }, () => new Participant())

	return {
		game: new Game(participants, gridSize, consecutiveTarget, rules, winConditions),
		participants: participants,
	}
}

const anyMoveValid: GameRuleFunction = () => true

it("New games start with an empty set of moves", () => {
	const { game } = gameWithParticipants()

	expect(game.moves()).toHaveLength(0)
})

/*
Here is a 3x3 grid for your convenience

["", "", ""],
["", "", ""],
["", "", ""]

... and a  20x20 empty grid for your inconvenience

["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
*/

it("Participant one making a move is captured", () => {
	const {
		game,
		participants: [p1],
	} = gameWithParticipants({
		rules: [anyMoveValid],
	})

	p1.makeMove({ x: 0, y: 0 })

	const expectedMove = { placement: { x: 0, y: 0 }, mover: p1 }
	expect(game.moves()[0]).toEqual<Move>(expectedMove)
})

it("Participant two making a move is captured", () => {
	const {
		game,
		participants: [p1, p2],
	} = gameWithParticipants({
		rules: [anyMoveValid],
	})

	makeMoves([
		[p1, ""],
		["", ""],
	])

	p2.makeMove({ x: 1, y: 1 })

	const expectedMove = { placement: { x: 1, y: 1 }, mover: p2 }
	expect(game.moves()[1]).toEqual<Move>(expectedMove)
})

it("Participant three making a move is captured", () => {
	const {
		game,
		participants: [p1, p2, p3],
	} = gameWithParticipants({
		rules: [anyMoveValid],
	})

	makeMoves([
		[p1, "", ""],
		["", p2, ""],
		["", "", ""],
	])

	p3.makeMove({ x: 2, y: 2 })

	const expectedMove = { placement: { x: 2, y: 2 }, mover: p3 }
	expect(game.moves()[2]).toEqual<Move>(expectedMove)
})

it("Game can handle a very high board size", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants({ boardSize: highBoardSize, rules: [anyMoveValid] })

	const moveWithHighCoordinates = { placement: { x: highBoardSize - 1, y: 0 }, mover: participantOne }
	participantOne.makeMove(moveWithHighCoordinates.placement)

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Game can handle a very high board size 2", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants({ boardSize: highBoardSize, rules: [anyMoveValid] })

	const moveWithHighCoordinates = { placement: { x: 0, y: highBoardSize - 1 }, mover: participantOne }
	participantOne.makeMove(moveWithHighCoordinates.placement)

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Emits a GameStart event", () => {
	const { game } = gameWithParticipants({ rules: [anyMoveValid] })
	const mockStartListener = vitest.fn()
	game.onStart(mockStartListener)

	game.start()

	expect(mockStartListener).toHaveBeenCalledTimes(1)
})

it("Emits move made events", () => {
	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants()

	const onMoveListener = vitest.fn<[Move], void>()
	game.onMove(onMoveListener)
	participantOne.makeMove({ x: 0, y: 0 })

	expect(onMoveListener).toHaveBeenCalledWith({ placement: { x: 0, y: 0 }, mover: participantOne })
})

describe("Out of order moves", () => {
	it("Participant one makes a turn out of order", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants()

		makeMoves([
			[p1, ""],
			["", ""],
		])

		const outOfTurnMove = { x: 1, y: 1 }
		p1.makeMove(outOfTurnMove)

		expect(game.moves()).toHaveLength(1)
	})

	it("Participant two makes a turn out of order", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants()

		makeMoves([
			[p1, ""],
			["", p2],
		])

		const outOfTurnMove = { x: 2, y: 2 }
		p2.makeMove(outOfTurnMove)

		expect(game.moves()).toHaveLength(2)
	})

	it("Participant two makes a second turn out of order", () => {
		const {
			game,
			participants: [p1, p2, p3],
		} = gameWithParticipants()

		makeMoves([
			[p1, "", ""],
			["", p2, ""],
			["", "", p3],
		])

		p2.makeMove({ x: 3, y: 3 })

		expect(game.moves()).toHaveLength(3)
	})

	it("Patricipant two makes the first turn out of order", () => {
		const {
			game,
			participants: [_, participantTwo],
		} = gameWithParticipants()

		participantTwo.makeMove({ x: 0, y: 0 })

		expect(game.moves()).toHaveLength(0)
	})
})

describe("Making an out of bound move", () => {
	const gameSize = faker.number.int({ min: 10, max: 100 })

	const testCases = [
		{ x: -1, y: 0 },
		{ x: 0, y: -1 },
		{ x: -9, y: -7 },
		{ x: 0, y: -7 },
		{ x: 100, y: 0 },
		{ x: 0, y: 100 },
		{ x: gameSize, y: 0 },
		{ x: 0, y: gameSize },
	]

	it.each(testCases)("'%s' is ignored", coordinates => {
		const {
			game,
			participants: [participantOne],
		} = gameWithParticipants({ boardSize: gameSize })

		participantOne.makeMove(coordinates)

		expect(game.moves()).toHaveLength(0)
	})
})

it("Making a move in a taken square", () => {
	// Ensure player can't move in a square that's already been taken
	const {
		game,
		participants: [p1, p2],
	} = gameWithParticipants()

	makeMoves([
		[p1, ""],
		["", ""],
	])

	p2.makeMove({ x: 0, y: 0 })

	expect(game.moves()).toHaveLength(1)
})

describe("Making a move that violates a rule in all scenarios", () => {
	it("Ignores the move", () => {
		const noMoveValid: GameRuleFunction = () => false
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			rules: [noMoveValid],
		})

		p2.makeMove({ x: 0, y: 0 })

		expect(game.moves()).toHaveLength(0)
	})
})

describe("Winning a game in all scenarios", () => {
	const firstMoveIsAWin: GameWinCondition = latestMove => ({
		result: "win",
		winningMoves: [latestMove],
	})

	it("Invokes win listener", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			winConditions: [firstMoveIsAWin],
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn<ArgumentsType<GameWonListener>, ReturnType<GameWonListener>>()
		game.onWin(mockWinListener)

		p1.makeMove({ x: 0, y: 0 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Returns the correct winning moves", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			winConditions: [firstMoveIsAWin],
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn<ArgumentsType<GameWonListener>, ReturnType<GameWonListener>>()
		game.onWin(mockWinListener)

		const winningPlacement = {
			x: faker.number.int({ min: 0 }),
			y: faker.number.int({ min: 0 }),
		}

		p1.makeMove(winningPlacement)

		expect(mockWinListener).toHaveBeenCalledWith([{ placement: winningPlacement, mover: p1 }])
	})
})
