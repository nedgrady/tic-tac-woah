import z from "zod"

export const QueueSchema = z.object({
	depth: z.number(),
})

export type QueueResponse = z.infer<typeof QueueSchema>
