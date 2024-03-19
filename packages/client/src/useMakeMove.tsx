import { CoordinatesDto, PendingMoveDto } from "types"
import { Coordinate } from "./redux/gameSlice"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"

export function useMakeMove(gameId: string) {
	const socket = useTicTacWoahSocket()

	return (coordinates: Coordinate) => {
		const coordinatesDto: CoordinatesDto = {
			...coordinates,
		}

		const moveDto: PendingMoveDto = {
			placement: coordinatesDto,
			gameId,
		}

		socket.emit("makeMove", moveDto)
	}
}
