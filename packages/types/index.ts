import z from "zod"
import { type Socket as ClientSocket } from "socket.io-client"

export const JoinQueueRequestSchema = z.object({
	humanCount: z.number(),
})

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

export const CompletedMoveDtoSchema = z.object({
	placement: CoordinatesDtoSchema,
	mover: z.string(),
	gameId: z.string(),
})
export type CompletedMoveDto = z.infer<typeof CompletedMoveDtoSchema>

export const GameStartDtoSchema = z.object({
	id: z.string(),
	players: z.array(z.string()),
	rules: z.object({
		boardSize: z.number(),
		consecutiveTarget: z.number(),
	}),
})

export type GameStartDto = z.infer<typeof GameStartDtoSchema>

export const GameWinSchema = z.object({
	winningMoves: CompletedMoveDtoSchema.array(),
})

export type GameWinDto = z.infer<typeof GameWinSchema>

export const PendingMoveDtoSchema = z.object({
	placement: CoordinatesDtoSchema,
	gameId: z.string(),
})
export type PendingMoveDto = z.infer<typeof PendingMoveDtoSchema>

export const GameDrawDtoScehma = z.object({
	gameId: z.string(),
})

export type GameDrawDto = z.infer<typeof GameDrawDtoScehma>

type AckCallback = (e: number) => void

export interface ClientToServerEvents {
	joinQueue(joinQueueRequest: JoinQueueRequest, callback?: AckCallback): void
	leaveQueue: (callback?: AckCallback) => void
	makeMove: (move: PendingMoveDto, callback?: AckCallback) => void
}

export interface ServerToClientEvents {
	noArg: () => void
	basicEmit: (a: number, b: string, c: Buffer) => void
	// withAck: (d: string, callback: (e: number) => void) => void
	gameStart: (gameStart: GameStartDto) => void
	moveMade: (move: CompletedMoveDto) => void
	gameWin: (gameWinDto: GameWinDto) => void
	gameDraw: (gameDrawDto: GameDrawDto) => void
}

export type TicTacWoahClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>
