import { createTheme, useMediaQuery } from "@mui/material"
import { useMemo } from "react"

export default function useAppTheme() {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? "dark" : "light",
				},
			}),
		[prefersDarkMode]
	)

	return theme
}
