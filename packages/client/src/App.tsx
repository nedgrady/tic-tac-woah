import { CssBaseline, ThemeProvider } from "@mui/material"
import useAppTheme from "./theme/useAppTheme"
import { RouterProvider } from "@tanstack/react-router"
import router from "./Routes"
import { Suspense } from "react"

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
