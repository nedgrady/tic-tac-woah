import z from "zod"

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
