import { expect, it, vitest, describe, ArgumentsType, vi } from "vitest"
import { Game, GameDrawListener, GameWonListener } from "./Game"
import { Move } from "./Move"
import { faker } from "@faker-js/faker"
import _ from "lodash"
import {
	GameConfiguration,
	GameRuleFunction,
	DecideWhoMayMoveNext,
	anyoneMayMoveNext,
	noMoveIsAllowed,
	sequenceOfPlayersMayMoveNext,
} from "./gameRules/gameRules"
import { GameDrawCondition, GameWinCondition, firstMoveIsAWin } from "./winConditions/winConditions"
import { makeMoves } from "./gameTestHelpers"
import { gameIsAlwaysDrawn } from "./drawConditions/drawConditions"
import { Participant } from "./Participant"

type GameTestDefinition = GameConfiguration & {
	participants?: Participant[]
	rules: readonly GameRuleFunction[]
	winConditions: readonly GameWinCondition[]
	drawConditions: readonly GameDrawCondition[]
	decideWhoMayMoveNext: DecideWhoMayMoveNext
}

function gameWithParticipants({
	boardSize: gridSize = 20,
	consecutiveTarget = 4,
	participants = Array.from({ length: 3 }, () => faker.string.alphanumeric(8)),
	rules = [anyMoveValid],
	winConditions = [],
	drawConditions = [],
	decideWhoMayMoveNext: decideWhoCanMoveNext = anyoneMayMoveNext,
}: Partial<GameTestDefinition> = {}) {
	return {
		game: new Game(
			participants,
			gridSize,
			consecutiveTarget,
			rules,
			winConditions,
			drawConditions,
			decideWhoCanMoveNext
		),
		participants: participants,
	}
}
const anyMoveValid: GameRuleFunction = () => true

it("New games start with an empty set of moves", () => {
	const { game } = gameWithParticipants()

	expect(game.moves()).toHaveLength(0)
})

it("Participant one making a move is captured", () => {
	const {
		game,
		participants: [p1],
	} = gameWithParticipants({
		rules: [anyMoveValid],
	})

	game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

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

	makeMoves(game, [
		[p1, ""],
		["", ""],
	])

	game.submitMove({ placement: { x: 1, y: 1 }, mover: p2 })

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

	makeMoves(game, [
		[p1, "", ""],
		["", p2, ""],
		["", "", ""],
	])

	game.submitMove({ placement: { x: 2, y: 2 }, mover: p3 })

	const expectedMove = { placement: { x: 2, y: 2 }, mover: p3 }
	expect(game.moves()[2]).toEqual<Move>(expectedMove)
})

it("Game can handle a very high board size", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [p1],
	} = gameWithParticipants({ boardSize: highBoardSize, rules: [anyMoveValid] })

	const moveWithHighCoordinates = { placement: { x: highBoardSize - 1, y: 0 }, mover: p1 }
	game.submitMove({ placement: moveWithHighCoordinates.placement, mover: p1 })

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Game can handle a very high board size 2", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [p1],
	} = gameWithParticipants({ boardSize: highBoardSize, rules: [anyMoveValid] })

	const moveWithHighCoordinates = { placement: { x: 0, y: highBoardSize - 1 }, mover: p1 }
	game.submitMove({ placement: moveWithHighCoordinates.placement, mover: p1 })

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
		participants: [p1],
	} = gameWithParticipants()

	const onMoveListener = vitest.fn<[Move], void>()
	game.onMoveCompleted(onMoveListener)
	game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

	expect(onMoveListener).toHaveBeenCalledWith({ placement: { x: 0, y: 0 }, mover: p1 })
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

		game.submitMove({ placement: { x: 0, y: 0 }, mover: p2 })

		expect(game.moves()).toHaveLength(0)
	})
})

describe("Winning a game in all scenarios", () => {
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

		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

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

		game.submitMove({ placement: winningPlacement, mover: p1 })

		expect(mockWinListener).toHaveBeenCalledWith([{ placement: winningPlacement, mover: p1 }])
	})
})

describe("Winning a game where a draw looks applicable", () => {
	const firstMoveIsAWin: GameWinCondition = latestMove => ({
		result: "win",
		winningMoves: [latestMove],
	})

	it("Only fires the win", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			winConditions: [firstMoveIsAWin],
			drawConditions: [gameIsAlwaysDrawn],
			rules: [anyMoveValid],
		})

		const mockWinListener = vitest.fn<ArgumentsType<GameWonListener>, ReturnType<GameWonListener>>()
		game.onWin(mockWinListener)

		const mockDrawListener = vitest.fn<ArgumentsType<GameDrawListener>, ReturnType<GameDrawListener>>()
		game.onDraw(mockDrawListener)

		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

		expect(mockWinListener).toHaveBeenCalledOnce()
		expect(mockDrawListener).not.toHaveBeenCalled()
	})
})

describe("Ending a game in all scenarios", () => {
	const firstMoveEndsGame: GameDrawCondition = () => ({
		result: "draw",
	})

	it("Invokes the end listener", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [anyMoveValid],
			drawConditions: [firstMoveEndsGame],
		})

		const mockDrawListener = vitest.fn<ArgumentsType<GameDrawListener>, ReturnType<GameDrawListener>>()
		game.onDraw(mockDrawListener)

		const terminalPlacement = {
			x: 0,
			y: 0,
		}

		game.submitMove({ placement: terminalPlacement, mover: p1 })

		expect(mockDrawListener).toHaveBeenCalled()
	})
})

describe("Non-terminal moves in all scenarios", () => {
	const gameNeverEnds: GameDrawCondition = () => ({
		result: "continues",
	})

	it("Does not invoke the draw listener", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [anyMoveValid],
			drawConditions: [gameNeverEnds],
		})

		const mockDrawListener = vitest.fn<ArgumentsType<GameDrawListener>, ReturnType<GameDrawListener>>()
		game.onDraw(mockDrawListener)

		const terminalPlacement = {
			x: 0,
			y: 0,
		}

		game.submitMove({ placement: terminalPlacement, mover: p1 })

		expect(mockDrawListener).not.toHaveBeenCalled()
	})
})

describe("Subscribing to available move", () => {
	it("Invokes a listener when a participant is allowed to move when the game has started", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [anyMoveValid],
			decideWhoMayMoveNext: anyoneMayMoveNext,
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		game.start()

		expect(mockParticipantMayMoveListener).toHaveBeenCalledOnce()
	})

	it("Does not invoke the listener when the game has not started", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [anyMoveValid],
			decideWhoMayMoveNext: anyoneMayMoveNext,
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		expect(mockParticipantMayMoveListener).not.toHaveBeenCalledOnce()
	})

	it("Invokes the listener after a valid move", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [anyMoveValid],
			decideWhoMayMoveNext: anyoneMayMoveNext,
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		game.start()
		mockParticipantMayMoveListener.mockClear()
		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

		expect(mockParticipantMayMoveListener).toHaveBeenCalledOnce()
	})

	it("Does not invoke the listener after an invalid move", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			rules: [noMoveIsAllowed],
			decideWhoMayMoveNext: anyoneMayMoveNext,
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		game.start()
		mockParticipantMayMoveListener.mockClear()
		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

		expect(mockParticipantMayMoveListener).not.toHaveBeenCalled()
	})

	it("Does not invoke the listener after a win", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			decideWhoMayMoveNext: anyoneMayMoveNext,
			winConditions: [firstMoveIsAWin],
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		game.start()
		mockParticipantMayMoveListener.mockClear()
		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

		expect(mockParticipantMayMoveListener).not.toHaveBeenCalled()
	})

	it("Does not invoke the listener after a draw", () => {
		const {
			game,
			participants: [p1],
		} = gameWithParticipants({
			decideWhoMayMoveNext: anyoneMayMoveNext,
			drawConditions: [gameIsAlwaysDrawn],
		})

		const mockParticipantMayMoveListener = vitest.fn()

		game.onParticipantMayMove(p1, mockParticipantMayMoveListener)

		game.start()
		mockParticipantMayMoveListener.mockClear()
		game.submitMove({ placement: { x: 0, y: 0 }, mover: p1 })

		expect(mockParticipantMayMoveListener).not.toHaveBeenCalled()
	})

	it("Respects the whoMayMoveNext", () => {
		const { game } = gameWithParticipants({
			decideWhoMayMoveNext: sequenceOfPlayersMayMoveNext("p1", "p2", "p3"),
		})

		const listenerForParticipant = {
			p1: vitest.fn(),
			p2: vitest.fn(),
			p3: vitest.fn(),
		}

		Object.entries(listenerForParticipant).forEach(([participant, listener]) => {
			game.onParticipantMayMove(participant, listener)
		})

		game.start()
		expect(listenerForParticipant["p1"]).toHaveBeenCalled()
		expect(listenerForParticipant["p2"]).not.toHaveBeenCalled()
		expect(listenerForParticipant["p3"]).not.toHaveBeenCalled()

		Object.entries(listenerForParticipant).forEach(([_, listener]) => {
			listener.mockClear()
		})

		game.submitMove({ placement: { x: 0, y: 0 }, mover: "p1" })
		expect(listenerForParticipant["p1"]).not.toHaveBeenCalled()
		expect(listenerForParticipant["p3"]).not.toHaveBeenCalled()
		expect(listenerForParticipant["p2"]).toHaveBeenCalled()

		Object.entries(listenerForParticipant).forEach(([_, listener]) => {
			listener.mockClear()
		})

		game.submitMove({ placement: { x: 1, y: 1 }, mover: "p2" })

		expect(listenerForParticipant["p3"]).toHaveBeenCalled()
		expect(listenerForParticipant["p1"]).not.toHaveBeenCalled()
		expect(listenerForParticipant["p2"]).not.toHaveBeenCalled()
	})
})
