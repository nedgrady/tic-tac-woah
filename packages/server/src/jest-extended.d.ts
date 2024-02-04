/* eslint-disable @typescript-eslint/no-explicit-any */
import type CustomMatchers from "jest-extended"
import "vitest"

interface MyCustomMatchers {}

declare module "vitest" {
	interface Assertion<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
	interface AsymmetricMatchersContaining<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
	interface ExpectStatic<T = any> extends CustomMatchers<T>, MyCustomMatchers {}
}
