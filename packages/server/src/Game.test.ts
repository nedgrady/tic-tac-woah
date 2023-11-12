import { expect, it, vitest } from "vitest"
import { Game } from "./Game"
import { Move } from "./Move"
import { Participant } from "./Participant"

it("New games start with an empty set of moves", () => {
	const participants: Participant[] = [new Participant(), new Participant(), new Participant()]
	const game = new Game(participants)

	expect(game.moves()).toHaveLength(0)
})

it("Participant one making a move is captured", () => {
	const participantOne = new Participant()
	const participants: Participant[] = [participantOne, new Participant(), new Participant()]
	const game = new Game(participants)
	participantOne.makeMove({ x: 0, y: 0 })

	const expectedMove = { placement: { x: 0, y: 0 }, mover: participantOne }
	expect(game.moves()[0]).toEqual<Move>(expectedMove)
})

it("Participant two making a move is captured", () => {
	const participantOne = new Participant()
	const participantTwo = new Participant()
	const participants: Participant[] = [participantOne, participantTwo, new Participant()]
	const game = new Game(participants)

	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })

	const expectedMove = { placement: { x: 1, y: 1 }, mover: participantTwo }
	expect(game.moves()[1]).toEqual<Move>(expectedMove)
})

it("Participant three making a move is captured", () => {
	const participantOne = new Participant()
	const participantTwo = new Participant()
	const participantThree = new Participant()
	const participants: Participant[] = [participantOne, participantTwo, participantThree]
	const game = new Game(participants)

	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })
	participantThree.makeMove({ x: 2, y: 2 })
	const expectedMove = { placement: { x: 2, y: 2 }, mover: participantThree }
	expect(game.moves()[2]).toEqual<Move>(expectedMove)
})

it("Emits a GameStart event", () => {
	const game = new Game([new Participant(), new Participant()])

	const mockStartListener = vitest.fn()

	game.onStart(mockStartListener)

	game.start()

	expect(mockStartListener).toHaveBeenCalledTimes(1)
})

it("Emits move made events", () => {
	const participantOne = new Participant()
	const participants: Participant[] = [participantOne, new Participant(), new Participant()]
	const game = new Game(participants)
	const onMoveListener = vitest.fn<[Move], void>()
	game.onMove(onMoveListener)
	participantOne.makeMove({ x: 0, y: 0 })

	expect(onMoveListener).toHaveBeenCalledWith({ placement: { x: 0, y: 0 }, mover: participantOne })
})

it("Participant one makes a turn out of order", () => {
	const participantOne = new Participant()
	const participants: Participant[] = [participantOne, new Participant(), new Participant()]
	const game = new Game(participants)
	participantOne.makeMove({ x: 0, y: 0 })

	const outOfTurnMove = { x: 1, y: 1 }
	participantOne.makeMove(outOfTurnMove)

	expect(game.moves()).toHaveLength(1)
})

it("Participant two makes a turn out of order", () => {
	const participantOne = new Participant()
	const participantTwo = new Participant()
	const participants: Participant[] = [participantOne, participantTwo, new Participant()]
	const game = new Game(participants)
	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })

	const outOfTurnMove = { x: 2, y: 2 }
	participantTwo.makeMove(outOfTurnMove)

	expect(game.moves()).toHaveLength(2)
})

it("Participant two makes a second turn out of order", () => {
	const participantOne = new Participant()
	const participantTwo = new Participant()
	const participantThree = new Participant()
	const participants: Participant[] = [participantOne, participantTwo, participantThree]
	const game = new Game(participants)
	participantOne.makeMove({ x: 0, y: 0 })
	participantTwo.makeMove({ x: 1, y: 1 })
	participantThree.makeMove({ x: 2, y: 2 })
	participantTwo.makeMove({ x: 3, y: 3 })

	expect(game.moves()).toHaveLength(3)
})

it("Patricipant two makes the first turn out of order", () => {
	const participantOne = new Participant()
	const participantTwo = new Participant()
	const participants: Participant[] = [participantOne, participantTwo, new Participant()]
	const game = new Game(participants)
	participantTwo.makeMove({ x: 0, y: 0 })

	expect(game.moves()).toHaveLength(0)
})
