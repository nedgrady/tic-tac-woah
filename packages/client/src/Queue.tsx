import { useEffectOnce } from "react-use"
import { GameStartDtoSchema, JoinQueueRequest } from "@tic-tac-woah/types"
import { useAppDispatch } from "./redux/hooks"
import { startGame } from "./redux/gameSlice"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"
import useSocketState from "./useSocketState"
import { useNavigate } from "@tanstack/react-router"
import { useQueue } from "./lobby/useQueue"
import { Suspense } from "react"
import { UserMustBeAuthenticated, useTicTacWoahAuth } from "./auth/UsernameMustBePresent"
import { Route } from "./routes/queue"

function ProtectedQueue() {
	return (
		<UserMustBeAuthenticated>
			<Queue />
		</UserMustBeAuthenticated>
	)
}

function Queue() {
	const dispatch = useAppDispatch()
	const socket = useTicTacWoahSocket()
	const auth = useTicTacWoahAuth()
	const socketState = useSocketState(socket)
	// TODO - how to not have to hardcode/import this?
	const navigate = useNavigate()
	const { consecutiveTarget, participantCount, botCount } = Route.useSearch()

	useEffectOnce(() => {
		socket.auth = {
			token: auth,
			type: "tic-tac-woah-username",
		}

		socket.on("gameStart", args => {
			const gameStart = GameStartDtoSchema.parse(args)
			console.log("gameStart", gameStart)
			dispatch(startGame(gameStart))
			navigate({
				to: `/game/$gameId`,
				params: { gameId: gameStart.id },
			})
		})

		const joinQueueRequest: JoinQueueRequest = {
			humanCount: participantCount,
			consecutiveTarget: consecutiveTarget,
			aiCount: botCount,
		}
		socket.emit("joinQueue", joinQueueRequest)

		return () => {
			socket.emit("leaveQueue")
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

export { ProtectedQueue as Queue }
