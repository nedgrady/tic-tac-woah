import { CoordinatesDto, CompletedMoveDto } from "types"
import { Coordinate } from "./redux/gameSlice"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"

export function useMakeMove(gameId: string) {
	const socket = useTicTacWoahSocket()

	return (coordinates: Coordinate) => {
		const coordinatesDto: CoordinatesDto = {
			...coordinates,
		}

		const moveDto: CompletedMoveDto = {
			placement: coordinatesDto,
			gameId,
			// TODO - the server can work this out from the socket connection
			// so probably need two DTOs
			mover: "",
		}

		socket.emit("makeMove", moveDto)
	}
}
