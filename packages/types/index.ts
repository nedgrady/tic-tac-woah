import z from "zod"
import { type Socket as ClientSocket } from "socket.io-client"

export const JoinQueueRequestSchema = z.object({})

export type JoinQueueRequest = z.infer<typeof JoinQueueRequestSchema>

export const QueueSchema = z.object({
	depth: z.number(),
})
export type QueueResponse = z.infer<typeof QueueSchema>

export const CoordinatesDtoSchema = z.object({
	x: z.number(),
	y: z.number(),
})
export type CoordinatesDto = z.infer<typeof CoordinatesDtoSchema>

export const MoveDtoSchema = z.object({
	placement: CoordinatesDtoSchema,
	mover: z.string(),
	gameId: z.string(),
})
export type MoveDto = z.infer<typeof MoveDtoSchema>

export const GameStartDtoSchema = z.object({
	id: z.string(),
	players: z.array(z.string()),
})
export type GameStartDto = z.infer<typeof GameStartDtoSchema>

export const GameWinSchema = z.object({
	winningMoves: MoveDtoSchema.array(),
})

export type GameWinDto = z.infer<typeof GameWinSchema>

type AckCallback = (e: number) => void

export interface ClientToServerEvents {
	joinQueue(joinQueueRequest: JoinQueueRequest, callback?: AckCallback): void
	makeMove: (move: MoveDto, callback?: AckCallback) => void
}

export interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	// withAck: (d: string, callback: (e: number) => void) => void
	gameStart: (gameStart: GameStartDto) => void
	moveMade: (move: MoveDto) => void
	gameWin: (gameWinDto: unknown) => void
}

export type TicTacWoahClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>
