import { ThemeProvider } from "@mui/material/styles"
import useAppTheme from "./theme/useAppTheme"
import { Navigate, RouterProvider, createRouter } from "@tanstack/react-router"
import { Suspense } from "react"
import CssBaseline from "@mui/material/CssBaseline"
import { routeTree } from "./routeTree.gen"
import { NotFoundRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./routes/__root"

const notFoundRoute = new NotFoundRoute({
	getParentRoute: () => rootRoute,
	component: () => <Navigate to="/" />,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const router = createRouter({ routeTree, notFoundRoute })

function App() {
	const theme = useAppTheme()

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{/* TODO - 🤔*/}
			<Suspense fallback={null}>
				<RouterProvider router={router} basepath="tic-tac-woah" />
			</Suspense>
		</ThemeProvider>
	)
}

export default App
