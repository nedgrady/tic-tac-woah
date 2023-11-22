import { CssBaseline, ThemeProvider } from "@mui/material"
import useAppTheme from "./theme/useAppTheme"
import { RouterProvider } from "@tanstack/react-router"
import router from "./Routes"

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
