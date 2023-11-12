import { expect, it, vitest, describe } from "vitest"
import { Game } from "./Game"
import { Move } from "./Move"
import { Participant } from "./Participant"
import { faker } from "@faker-js/faker"

function gameWithParticipants(gridSize: number = 20) {
	const participants: readonly Participant[] = [new Participant(), new Participant(), new Participant()]

	return { game: new Game(participants, gridSize), participants: participants }
}

it("New games start with an empty set of moves", () => {
	const { game } = gameWithParticipants()

	expect(game.moves()).toHaveLength(0)
})

it("Participant one making a move is captured", () => {
	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants()

	participantOne.makeMove({ x: 0, y: 0 })

	const expectedMove = { placement: { x: 0, y: 0 }, mover: participantOne }
	expect(game.moves()[0]).toEqual<Move>(expectedMove)
})

it("Participant two making a move is captured", () => {
	const {
		game,
		participants: [participantOne, participantTwo],
	} = gameWithParticipants()

	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })

	const expectedMove = { placement: { x: 1, y: 1 }, mover: participantTwo }
	expect(game.moves()[1]).toEqual<Move>(expectedMove)
})

it("Participant three making a move is captured", () => {
	const {
		game,
		participants: [participantOne, participantTwo, participantThree],
	} = gameWithParticipants()

	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })
	participantThree.makeMove({ x: 2, y: 2 })

	const expectedMove = { placement: { x: 2, y: 2 }, mover: participantThree }
	expect(game.moves()[2]).toEqual<Move>(expectedMove)
})

it("Game can handle a very high board size", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants(highBoardSize)

	const moveWithHighCoordinates = { placement: { x: highBoardSize - 1, y: 0 }, mover: participantOne }
	participantOne.makeMove(moveWithHighCoordinates.placement)

	expect(game.moves()[0]).toEqual<Move>(moveWithHighCoordinates)
})

it("Game can handle a very high board size 2", () => {
	const highBoardSize = faker.number.int({ min: 1000, max: 10000 })

	const {
		game,
		participants: [participantOne],
	} = gameWithParticipants(highBoardSize)

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
			participants: [participantOne],
		} = gameWithParticipants()

		participantOne.makeMove({ x: 0, y: 0 })

		const outOfTurnMove = { x: 1, y: 1 }
		participantOne.makeMove(outOfTurnMove)

		expect(game.moves()).toHaveLength(1)
	})

	it("Participant two makes a turn out of order", () => {
		const {
			game,
			participants: [participantOne, participantTwo],
		} = gameWithParticipants()

		participantOne.makeMove({ x: 0, y: 0 })
		participantTwo.makeMove({ x: 1, y: 1 })

		const outOfTurnMove = { x: 2, y: 2 }
		participantTwo.makeMove(outOfTurnMove)

		expect(game.moves()).toHaveLength(2)
	})

	it("Participant two makes a second turn out of order", () => {
		const {
			game,
			participants: [participantOne, participantTwo, participantThree],
		} = gameWithParticipants()

		participantOne.makeMove({ x: 0, y: 0 })
		participantTwo.makeMove({ x: 1, y: 1 })
		participantThree.makeMove({ x: 2, y: 2 })

		participantTwo.makeMove({ x: 3, y: 3 })

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
		} = gameWithParticipants(20)

		participantOne.makeMove(coordinates)

		expect(game.moves()).toHaveLength(0)
	})
})
