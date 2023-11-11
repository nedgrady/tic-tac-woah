import { CoordinatesDto } from "types"
import { Coordinate } from "./redux/gameSlice"
import { useTicTacWoahSocket } from "./ticTacWoahSocket"

export function useMakeMove() {
	const socket = useTicTacWoahSocket()

	return (coordinates: Coordinate) => {
		const coordinatesDto: CoordinatesDto = {
			...coordinates,
		}

		socket.emit("move", JSON.stringify(coordinatesDto))
	}
}
