import { RootRoute, Route, Navigate, Router } from "@tanstack/react-router"
import { Home } from "./Home"
import { Queue } from "./Queue"
import { Root } from "./Root"
import { Game } from "./game/Game"

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
	component: ({ useParams }) => {
		const { gameId } = useParams()
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
