import { createFileRoute } from "@tanstack/react-router"

import { Queue } from "../Queue"
import { z } from "zod"

const CreateGameSettingsSchema = z.object({
	consecutiveTarget: z.number().int().negative(),
	participantCount: z.number().int().positive(),
	botCount: z.number(),
})

export type CreateGameSettings = z.infer<typeof CreateGameSettingsSchema>

export const Route = createFileRoute("/queue")({
	component: Queue,
	beforeLoad: async () => {
		// TODO - how to not have to hardcode/import this?
		console.log("Not implemented 123")
		throw new Error("Not implemented 123")
	},
	onError: (error: Error) => {
		console.error("Error loading queue", error)
		Route.router?.navigate({ to: "/" })
	},
	validateSearch: () => {
		// CreateGameSettingsSchema.parse
		console.log("Not implemented 123")
		throw new Error("Not implemented 123")
	},
})
