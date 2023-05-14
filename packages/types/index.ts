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
