import { ClientToServerEvents } from "@tic-tac-woah/types"

export type TicTacWoahClientToServerEventName = keyof ClientToServerEvents
export type TicTacWoahEventPayload<EventName extends TicTacWoahClientToServerEventName> = Parameters<
	ClientToServerEvents[EventName]
>[0]
export type TicTacWoahClientToServerEventMap = {
	[EventNameKey in TicTacWoahClientToServerEventName]: TicTacWoahEventPayload<EventNameKey>
}
