import { useAppSelector } from "./redux/hooks"
import { Game } from "./game/Game"
import { Lobby } from "./lobby/Lobby"

export function Play() {
	const { game } = useAppSelector(state => state.gameReducer)
	if (game.id == "Empty Game") return <Lobby />

	return <Game />
}
