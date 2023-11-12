import { expect, it, vitest, describe, test } from "vitest"
import { Game } from "./Game"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { faker } from "@faker-js/faker"
import _ from "lodash"
import { GameConfiguration, GameRuleFunction, standardRules } from "./gameRules"
import { standardWinConditions, winByConsecutiveVerticalPlacements } from "./winConditions"

type GameTestDefinition = GameConfiguration & {
	participantCount?: number
	rules: readonly GameRuleFunction[]
	winConditions: readonly GameRuleFunction[]
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

type PlacementSpecification = (Participant | Empty)[][]
type Empty = ""

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

function makeMoves(placementDefinitions: PlacementSpecification) {
	placementDefinitions.forEach((row, rowIndex) => {
		row.forEach((participant, columnIndex) => {
			if (participant === "") return

			participant.makeMove({ x: columnIndex, y: rowIndex })
		})
	})
}

it("Participant one making a move is captured", () => {
	const {
		game,
		participants: [p1],
	} = gameWithParticipants()

	p1.makeMove({ x: 0, y: 0 })

	const expectedMove = { placement: { x: 0, y: 0 }, mover: p1 }
	expect(game.moves()[0]).toEqual<Move>(expectedMove)
})

it("Participant two making a move is captured", () => {
	const {
		game,
		participants: [p1, p2],
	} = gameWithParticipants()

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
	} = gameWithParticipants()

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
	} = gameWithParticipants({ boardSize: highBoardSize })

	const moveWithHighCoordinates = { placement: { x: highBoardSize - 1, y: 0 }, mover: participantOne }
	participantOne.makeMove(moveWithHighCoordinates.placement)

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Game can handle a very high board size 2", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants({ boardSize: highBoardSize })

	const moveWithHighCoordinates = { placement: { x: 0, y: highBoardSize - 1 }, mover: participantOne }
	participantOne.makeMove(moveWithHighCoordinates.placement)

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Emits a GameStart event", () => {
	const { game } = gameWithParticipants()
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

describe("Winning a game vertically", () => {
	it("Is triggered when player one in the top left", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 3,
			participantCount: 2,
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p1, "", p2],
			[p1, "", p2],
			["", "", ""],
		])

		p1.makeMove({ x: 0, y: 2 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Is not triggered in the same scenario as above but a higher target...", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 4,
			participantCount: 2,
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p1, "", p2],
			[p1, "", p2],
			["", "", ""],
		])

		p1.makeMove({ x: 0, y: 2 })

		expect(mockWinListener).not.toHaveBeenCalledOnce()
	})

	it("Is triggered when player two wins in the top left", () => {
		const {
			game,
			participants: [_, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 3,
			participantCount: 2,
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p2, "", ""],
			[p2, "", ""],
			["", "", ""],
		])

		p2.makeMove({ x: 0, y: 2 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Is not triggered when a player makes non-consecutive moves in the same column", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 3,
			participantCount: 2,
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p1, "", "", ""],
			[p2, "", "", ""],
			[p1, "", "", ""],
			[p2, "", "", ""],
		])

		p1.makeMove({ x: 0, y: 4 })

		expect(mockWinListener).not.toHaveBeenCalledOnce()
	})

	it("Is triggered when player one wins in the bottom left", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 3,
			participantCount: 2,
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			["", "", "", "", "", "", "", "", "", p2, "", "", "", "", "", "", "", "", "", ""],
			["", "", "", "", "", "", "", "", "", p2, "", "", "", "", "", "", "", "", "", ""],
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
			[p1, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
			[p1, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		])

		p1.makeMove({ x: 0, y: 17 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Is triggered when player one wins an arbitrarily large game", () => {
		const gridSize = faker.number.int({ min: 10, max: 100 })

		const {
			game,
			participants: [participantOne, participantTwo],
		} = gameWithParticipants({
			boardSize: gridSize,
			consecutiveTarget: gridSize,
			participantCount: 2,
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		const nonWinningCoordinateIndices = Array.from({ length: gridSize - 1 }, (_, index) => index)

		const participantOneCoordinatesForNonWinningMoves = nonWinningCoordinateIndices.map((_, index) => ({
			x: 0,
			y: index,
		}))

		const participantTwoCoordinates = nonWinningCoordinateIndices.map((_, index) => ({
			x: 1,
			y: index,
		}))

		nonWinningCoordinateIndices.forEach(index => {
			participantOne.makeMove(participantOneCoordinatesForNonWinningMoves[index])
			participantTwo.makeMove(participantTwoCoordinates[index])
		})

		const participantOneCoordinatesForWinningMove = { x: 0, y: gridSize - 1 }

		participantOne.makeMove(participantOneCoordinatesForWinningMove)

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Is not triggered when player two makes their first non-terminal move", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants()

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)
		makeMoves([
			[p1, "", ""],
			["", "", ""],
			["", "", ""],
		])

		p2.makeMove({ x: 1, y: 1 })

		expect(mockWinListener).not.toHaveBeenCalled()
	})

	it("Is triggered when player one wins in an arbitrary column", () => {
		const gridSize = 20
		const winningColumnIndex = faker.number.int({ min: 1, max: gridSize - 1 })

		const {
			game,
			participants: [participantOne, participantTwo],
		} = gameWithParticipants({
			boardSize: gridSize,
			consecutiveTarget: 3,
			participantCount: 2,
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		participantOne.makeMove({ x: winningColumnIndex, y: 0 })
		participantTwo.makeMove({ x: 0, y: 0 })
		participantOne.makeMove({ x: winningColumnIndex, y: 1 })
		participantTwo.makeMove({ x: 0, y: 1 })
		participantOne.makeMove({ x: winningColumnIndex, y: 2 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})

	it("Is triggered when player one wins after making moves in various columns", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 5,
			consecutiveTarget: 3,
			participantCount: 2,
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p1, p2, "", p1, p2],
			[p1, p2, "", p1, p2],
			["", "", "", "", ""],
			["", "", "", "", ""],
			["", "", "", "", ""],
		])

		p1.makeMove({ x: 3, y: 2 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})
})

describe("Winning a game horizontally", () => {
	it("Is triggered when player one wins in the top left", () => {
		const {
			game,
			participants: [p1, p2],
		} = gameWithParticipants({
			boardSize: 20,
			consecutiveTarget: 3,
			participantCount: 2,
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn()
		game.onWin(mockWinListener)

		makeMoves([
			[p1, p1, ""],
			[p2, p2, ""],
			["", "", ""],
		])

		p1.makeMove({ x: 2, y: 0 })

		expect(mockWinListener).toHaveBeenCalledOnce()
	})
})
