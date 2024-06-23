/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActiveUser, TicTacWoahEventMap, TicTacWoahEventName } from "TicTacWoahSocketServer"
import type CustomMatchers from "jest-extended"
import "vitest"

// interface MyCustomMatchers {
// 	toContainActiveUser(): CustomMatcherResult
// }

interface CustomMatchers<R = unknown> {
	toBeActiveUser(activeUser: ActiveUser): R
	toContainActiveUser(activeUser: ActiveUser): R
	toContainSingleActiveUser(activeUser: ActiveUser): R
	toOnlyContainActiveUsers(...activeUsers: ActiveUser[]): R
	toContainSingle<TItem>(activeUser: TItem): R
	toHaveReceivedEvent(event: TicTacWoahEventName): R
	toHaveReceivedPayload<TEvent extends TicTacWoahEventName>(event: TEvent, payload: TicTacWoahEventMap[TEvent])
	toHaveOnlyReceivedPayloadForEvent<TEvent extends TicTacWoahEventName>(
		event: TEvent,
		payload: TicTacWoahEventMap[TEvent],
	)
}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T>, CustomMatchers {}
	interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T>, CustomMatchers {}
	interface ExpectStatic<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
}
