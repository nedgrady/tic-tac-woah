import { useSelector } from "react-redux"
import { selectBoardState } from "./redux/gameSlice"
import { useAppSelector } from "./redux/hooks"

type Token = string
const tokens: readonly Token[] = ["❌", "⭕", "🟥"]

function useGameDisplay() {
	const { players, id } = useAppSelector(state => state.gameReducer)
	const boardState = useAppSelector(selectBoardState)

	if (id == "Empty Game") {
		return { board: [] }
	}

	const tokensPlusEmpty = [...tokens, ""]
	const playerPlusEmpty = [...players, null]

	console.log(tokensPlusEmpty)
	console.log(playerPlusEmpty)

	const playerTokens = new Map<string | null, Token>(
		playerPlusEmpty.map((player, index) => [player, tokensPlusEmpty[index]])
	)

	console.log(playerTokens)
	// TODO - how to remove the undefined from the type?
	const board = boardState.map(row => row.map(cell => playerTokens.get(cell)))

	return { board }
}

export function Game() {
	const { board } = useGameDisplay()

	return (
		<div className="game">
			{board.map((row, rowIndex) => (
				<div key={rowIndex}>
					{row.map((cell, cellIndex) => (
						<div key={cellIndex}>{cell}</div>
					))}
				</div>
			))}
		</div>
	)
}
