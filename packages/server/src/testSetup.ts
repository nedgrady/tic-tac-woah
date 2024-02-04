import { expect } from "vitest"
import * as matchers from "jest-extended"
expect.extend(matchers)

expect.extend({
	toFoo() {
		return {
			message: () => `${this.isNot}`,
			pass: true,
		}
	},
})
