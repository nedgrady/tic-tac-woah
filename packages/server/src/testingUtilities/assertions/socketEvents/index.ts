import { TicTacWoahEventName, TicTacWoahEventMap } from "TicTacWoahSocketServer"
import { AssertableTicTacWoahClientSocket } from "testingUtilities/serverSetup/ticTacWoahTest"
import { expect } from "vitest"

export const matchers: Parameters<(typeof expect)["extend"]>[0] = {
	toHaveReceivedPayload(
		received: AssertableTicTacWoahClientSocket,
		event: TicTacWoahEventName,
		payload: TicTacWoahEventMap[TicTacWoahEventName]
	) {
		const eventsOfExpectedType = received.events.get(event)
		const pass = this.equals(eventsOfExpectedType, expect.arrayContaining([payload]))
		return {
			message: () =>
				`Expected client '${received.id}' ${
					this.isNot ? "not " : " "
				} to have received a '${event}' payload matching \n${this.utils.printExpected(
					payload
				)}\n but received \n${this.utils.printReceived(eventsOfExpectedType)}`,
			pass,
		}
	},
	toHaveReceivedEvent(received: AssertableTicTacWoahClientSocket, expectedEvent: TicTacWoahEventName) {
		const eventsOfExpectedType = received.events.get(expectedEvent)
		return {
			message: () =>
				`Expected client '${received.id}' with events ${this.utils.printReceived(eventsOfExpectedType)} to ${
					this.isNot ? "not " : " "
				}have received a '${expectedEvent}' event`,
			pass: eventsOfExpectedType !== undefined && eventsOfExpectedType.length > 0,
		}
	},
}
