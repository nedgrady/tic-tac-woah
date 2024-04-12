import { expect } from "vitest"

export const matchers: Parameters<(typeof expect)["extend"]>[0] = {
	toContainSingle(received: unknown[], expectedItem: unknown) {
		const pass = this.equals(received, expect.arrayContaining([expectedItem]))
		return {
			message: () => `Expected  .\n${this.utils.diff(received, [expectedItem])}`,
			pass,
		}
	},
}
