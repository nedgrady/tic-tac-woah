import { faker } from "@faker-js/faker"
import readline from "readline"
import jsonToCsvExport from "json-to-csv-export"
import data from "./data.json"

// interface MadeMove {
// 	player: string
// 	position: {
// 		x: number
// 		y: number
// 	}
// }

// interface SuggestedMove {
// 	x: number
// 	y: number
// }

// interface NextMoveTestCase {
// 	boardSize: number
// 	players: string[]
// 	consecutiveTarget: number
// 	madeMoves: MadeMove[]
// }

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

const possiblePlayers = ["X", "O", "Y", "Z", "A", "B", "C", "D", "E", "F"]

function createRandomPosition(boardSize, players) {
	const totalNumberOfRandomMovesToMake = faker.number.int({ min: 0, max: boardSize })

	const moves = []
	const takenPositions = new Set()

	for (let i = 0; i < totalNumberOfRandomMovesToMake; i++) {
		let x, y
		let positionKey

		// Generate a new position until an empty one is found
		do {
			x = Math.floor(Math.random() * boardSize)
			y = Math.floor(Math.random() * boardSize)
			positionKey = `${x},${y}`
		} while (takenPositions.has(positionKey))

		const player = players[i % players.length]
		const move = {
			player,
			position: { x, y },
		}

		moves.push(move)
		takenPositions.add(positionKey)
	}

	return moves
}

const totalPositions = 3
for (let i = 0; i < totalPositions; i++) {
	const boardSize = faker.number.int({ min: 3, max: 20 })
	const consecutiveTarget = faker.number.int({ min: 2, max: 5 })

	const playerCount = faker.number.int({ min: 2, max: 5 })
	const players = possiblePlayers.slice(0, playerCount).sort(() => Math.random() - 0.5)

	const madeMoves = createRandomPosition(boardSize, players)

	const testCase = {
		boardSize,
		players,
		consecutiveTarget,
		madeMoves,
		playingAs: players[0],
	}

	prettyPrintTestCase(testCase)

	rl.question("Enter your next move (format: x,y): ", answer => {
		const [x, y] = answer.split(",").map(Number)
		const nextMove = { player: players[0], position: { x, y } }
		console.log("Next move:", nextMove)
		testCase.nextMove = nextMove

		console.log(testCase)
	})
}

function prettyPrintTestCase(testCase) {
	const { boardSize, players, consecutiveTarget, madeMoves, playingAs } = testCase

	const boardState = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => " "))

	// Populate the board with moves
	madeMoves.forEach(move => {
		const { x, y } = move.position
		boardState[y][x] = move.player
	})

	console.log(`boardSize: ${boardSize}`)
	console.log(`players: ${players.join(", ")}`)
	console.log(`consecutiveTarget: ${consecutiveTarget}`)
	console.log(`playingAs: ${playingAs}`)
	console.log(`board:`)

	// // Print each row of the board
	// for (let row = 0; row < boardSize; row++) {
	// 	console.log(boardState[row].join(" | "))
	// }

	// Print column indices
	const columnIndices = Array.from({ length: boardSize }, (_, i) => (i > 10 ? "" : "0") + i).join("  ")
	console.log(`   ${columnIndices}`)

	// Print each row of the board with row indices
	for (let y = 0; y < boardSize; y++) {
		const row = boardState[y].join(" | ")
		console.log(`${(y >= 10 ? "" : "0") + y}  ${row}`)
	}
}
