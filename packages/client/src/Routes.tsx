import { RootRoute, Route, Navigate, Router } from "@tanstack/react-router"
import { Home } from "./Home"
import { Queue } from "./Queue"
import { Root } from "./Root"
import { Game } from "./game/Game"
import { useAppSelector } from "./redux/hooks"

const rootRoute = new RootRoute({
	component: Root,
})

const homeRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Home,
})

export const queueRoot = new Route({
	getParentRoute: () => rootRoute,
	path: "queue",
	component: Queue,
})

const activeGameRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "game/$gameId",
	component: () => {
		// TODO - probably use this
		const gameId = activeGameRoute.useParams()

		// TODO - this looks simiar to the logic in Play.tsx
		const { game } = useAppSelector(state => state.gameReducer)
		if (game.id === "Empty Game") return <Navigate to="/queue" />
		return <Game />
	},
})

const redirectHomeRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "*",
	component: () => {
		return <Navigate to="/" />
	},
})

const routeTree = rootRoute.addChildren([queueRoot, homeRoute, activeGameRoute, redirectHomeRoute])

const router = new Router({ routeTree })

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

export default router
