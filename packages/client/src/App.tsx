import { useEffectOnce } from "react-use"
import { GameStartDtoSchema } from "types"
import { useAppDispatch } from "./redux/hooks"
import { startGame } from "./redux/gameSlice"
import { CssBaseline, ThemeProvider } from "@mui/material"
import useAppTheme from "./theme/useAppTheme"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"
import useSocketState from "./useSocketState"
import { Outlet, RouterProvider, Link, Router, Route, RootRoute, useNavigate, Navigate } from "@tanstack/react-router"
import { Game } from "./game/Game"
import { Header } from "./Header"
import { useQueue } from "./lobby/useQueue"
import { Suspense } from "react"

const rootRoute = new RootRoute({
	component: Root,
})

function Root() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	)
}

const homeRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Home,
})

function Home() {
	return <Link to="queue">Play Now</Link>
}

const queueRoot = new Route({
	getParentRoute: () => rootRoute,
	path: "queue",
	component: Queue,
})

function Queue() {
	const dispatch = useAppDispatch()
	const socket = useTicTacWoahSocket()
	const socketState = useSocketState(socket)
	const navigate = useNavigate({ from: queueRoot.id })

	useEffectOnce(() => {
		socket.on("game start", args => {
			const gameStart = GameStartDtoSchema.parse(args)
			dispatch(startGame(gameStart))
			navigate({
				to: `/game/$gameId`,
				params: { gameId: gameStart.id },
			})
		})

		return () => {
			socket.off()
		}
	})

	const { queue } = useQueue()

	return (
		<>
			{socketState == "connected" ? (
				<Suspense fallback={<>Loading Queue...</>}>
					<>Currently {queue?.depth} people waiting</>
				</Suspense>
			) : (
				<p>Disconnected or connecting...</p>
			)}
		</>
	)
}

const activeGameRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "game/$gameId",
	component: ({ useParams }) => {
		const { gameId } = useParams()
		return (
			<>
				<Game />
			</>
		)
	},
})

export const redirectHomeRoute = new Route({
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

function App() {
	const theme = useAppTheme()

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<RouterProvider router={router} basepath="tic-tac-woah" />
		</ThemeProvider>
	)
}

export default App
