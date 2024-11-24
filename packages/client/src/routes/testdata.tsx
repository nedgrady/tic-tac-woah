import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import Board from "../Board"
import { c } from "vite/dist/node/types.d-aGj9QkWt"
import { Button } from "@mui/material"
import _ from "lodash"

function randomNumberBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

interface MadeMove {
	player: string
	position: {
		x: number
		y: number
	}
}

interface SuggestedMove {
	x: number
	y: number
}

interface NextMoveTestCase {
	boardSize: number
	players: string[]
	consecutiveTarget: number
	madeMoves: MadeMove[]
	playingAs: string
}

interface BoardMoveDisplay {
	readonly placement: { x: number; y: number }
	readonly token: string
	readonly isWinningMove: boolean
}

// const possiblePlayers = ["X", "O", "Y", "Z", "A", "B", "C", "D", "E", "F"]
const possiblePlayers = ["🟥", "🟦", "🟧", "🟨", "🟩", "🟪", "🟫"]

function createRandomPosition(boardSize: number, players: string[]) {
	const totalNumberOfRandomMovesToMake = randomNumberBetween(0, boardSize * boardSize)

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

function createRandomTestCase(): NextMoveTestCase {
	const boardSize = randomNumberBetween(3, 20)
	const consecutiveTarget = Math.min(randomNumberBetween(3, 6), boardSize)

	const playerCount = randomNumberBetween(2, 5)
	const players = _.shuffle(possiblePlayers).slice(0, playerCount)
	// possiblePlayers.slice(0, playerCount).sort(() => Math.random() - 0.5)

	const madeMoves = createRandomPosition(boardSize, players)

	const testCase = {
		boardSize,
		players,
		consecutiveTarget,
		madeMoves,
		playingAs: players[0],
	}

	return testCase
}

function prettyPrintTestCase(testCase: NextMoveTestCase) {
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

export const Route = createFileRoute("/testdata")({
	component: TestData,
})

function TestData() {
	const [currentTestCase, setCurrentTestCase] = useState<NextMoveTestCase>(createRandomTestCase())
	const [completedTestCases, setCompletedTestCases] = useState<
		(NextMoveTestCase & { suggestedMove: SuggestedMove })[]
	>([])

	const board: BoardMoveDisplay[][] = Array(currentTestCase.boardSize)
		.fill(null)
		.map(() =>
			Array(currentTestCase.boardSize).fill({
				isWinningMove: false,
				token: "",
			}),
		)

	for (const move of currentTestCase.madeMoves) {
		board[move.position.x][move.position.y] = {
			placement: move.position,
			token: move.player,
			isWinningMove: false,
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "row", gap: "4px" }}>
			<div style={{ width: "10%" }}>
				<h1>{currentTestCase.playingAs}</h1>
				<h1>{currentTestCase.consecutiveTarget}</h1>
				<Button
					variant="contained"
					onClick={() => {
						const fileName = "myData.json"

						// Create a blob of the data
						const fileToSave = new Blob([JSON.stringify(completedTestCases)], {
							type: "application/json",
						})

						const a = document.createElement("a") // Create "a" element

						const url = URL.createObjectURL(fileToSave) // Create an object URL from blob
						a.setAttribute("href", url) // Set "a" element link
						a.setAttribute("download", fileName) // Set download filename
						a.click() // Start downloading
					}}
				>
					Download Results
				</Button>
			</div>
			<Board
				boardState={board}
				limitingDimensionInPixels={900}
				onPiecePlaced={(x, y) => {
					// console.log({ currentTestCase, suggestedMove: { x, y } })
					setCompletedTestCases([...completedTestCases, { ...currentTestCase, suggestedMove: { x, y } }])
					setCurrentTestCase(createRandomTestCase())
				}}
			/>
			<div>
				<p>Finished {completedTestCases.length} cases</p>
			</div>
		</div>
	)
}
