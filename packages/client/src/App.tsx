import { useEffectOnce } from "react-use"
import { GameStartDtoSchema, MoveDtoSchema } from "types"
import { useAppDispatch } from "./redux/hooks"
import { newMove, startGame } from "./redux/gameSlice"
import { CssBaseline, ThemeProvider } from "@mui/material"
import useAppTheme from "./theme/useAppTheme"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"
import { Play } from "./Play"
import useSocketState from "./useSocketState"

function App() {
	const dispatch = useAppDispatch()
	const theme = useAppTheme()
	const socket = useTicTacWoahSocket()
	const socketState = useSocketState(socket)

	useEffectOnce(() => {
		socket.on("game start", args => {
			const gameStart = GameStartDtoSchema.parse(args)
			dispatch(startGame(gameStart))
		})

		socket.on("move", args => {
			const move = MoveDtoSchema.parse(args)
			dispatch(newMove(move))
		})

		socket.on("game win", args => {
			console.log("game win", args)
		})

		return () => {
			socket.off()
		}
	})

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			{socketState == "connected" ? <Play /> : <p>Disconnected or connecting...</p>}
		</ThemeProvider>
	)
}

export default App
