import { Navigate, createLazyFileRoute } from "@tanstack/react-router"

import { useAppSelector } from "../../redux/hooks"
import { Game } from "../../game/Game"

export const Route = createLazyFileRoute("/game/$gameId")({
	component: GameRoute,
})

function GameRoute() {
	// TODO - probably use this
	const thing = Route.useParams()
	// TODO - this looks simiar to the logic in Play.tsx
	const { game } = useAppSelector(state => state.gameReducer)

	if (game.id === "Empty Game") return <Navigate to="/play" />

	return <Game />
}

// const activeGameRoute = new Route({
// 	getParentRoute: () => rootRoute,
// 	path: "game/$gameId",
// 	component: () => {
// 		// TODO - probably use this
// 		const gameId = activeGameRoute.useParams()

// 		// TODO - this looks simiar to the logic in Play.tsx
// 		const { game } = useAppSelector(state => state.gameReducer)
// 		if (game.id === "Empty Game") return <Navigate to="/queue" />
// 		return <Game />
// 	},
// })
