/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActiveUser } from "TicTacWoahSocketServer"
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
}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
	interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
	interface ExpectStatic<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
}
