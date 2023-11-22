import { useEffectOnce } from "react-use"
import { GameStartDtoSchema } from "types"
import { useAppDispatch } from "./redux/hooks"
import { startGame } from "./redux/gameSlice"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"
import useSocketState from "./useSocketState"
import { useNavigate } from "@tanstack/react-router"
import { useQueue } from "./lobby/useQueue"
import { Suspense } from "react"
import { queueRoot } from "./Routes"

export function Queue() {
	const dispatch = useAppDispatch()
	const socket = useTicTacWoahSocket()
	const socketState = useSocketState(socket)
	// TODO - how to not have to hardcode/import this?
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
				<p>Attempting to connect to the tic tac WOAH! server.</p>
			)}
		</>
	)
}
