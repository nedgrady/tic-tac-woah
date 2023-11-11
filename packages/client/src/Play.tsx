import { useAppSelector } from "./redux/hooks"
import { Game } from "./Game"
import { Lobby } from "./lobby/Lobby"
import { useMakeMove } from "./useMakeMove"

export function Play() {
	const { game } = useAppSelector(state => state.gameReducer)
	const makeMove = useMakeMove()

	if (game.id == "Empty Game") return <Lobby />

	return <Game submitMove={makeMove} />
}
