import { expect } from "vitest"
import * as matchers from "jest-extended"
import { ActiveUser, TicTacWoahEventMap, TicTacWoahEventName } from "TicTacWoahSocketServer"
import { AssertableTicTacWoahClientSocket } from "ticTacWoahTest"

expect.extend(matchers)

type ActiveUserEqualityContract = Pick<ActiveUser, "uniqueIdentifier"> & { connectionIds: string[] }

function formatActiveUser(activeUser: ActiveUser) {
	return {
		uniqueIdentifier: activeUser.uniqueIdentifier,
		connections: activeUser.connections.size,
	}
}

function toImportantBits(activeUser: ActiveUser): ActiveUserEqualityContract {
	return {
		uniqueIdentifier: activeUser.uniqueIdentifier,
		connectionIds: [...activeUser.connections].map(connection => connection.id),
	}
}

expect.extend({
	toBeActiveUser(received: ActiveUser, activeUser: ActiveUser) {
		const receivedBitsWeCareAbout = toImportantBits(received)
		const expectedBitsWeCareAbout = toImportantBits(activeUser)
		return {
			message: () =>
				`Expected the same active user\n. ${this.utils.diff(receivedBitsWeCareAbout, expectedBitsWeCareAbout)}`,
			pass: this.equals(expectedBitsWeCareAbout, receivedBitsWeCareAbout),
		}
	},

	toContainActiveUser(received: ActiveUser[], activeUser: ActiveUser) {
		return {
			message: () =>
				`Expected received collection to contain active user.\n${this.utils.diff(
					received.map(toImportantBits),
					toImportantBits(activeUser)
				)}`,
			pass: received.some(receivedUser => this.equals(receivedUser, activeUser)),
		}
	},

	toContainSingleActiveUser(received: ActiveUser[], activeUser: ActiveUser) {
		const pass: boolean = received.length === 1 && this.equals(received[0], activeUser)

		return {
			message: () =>
				`Expected ActiveUser array to contain the received ActiveUser\n. ${this.utils.diff(
					received.map(formatActiveUser),
					formatActiveUser(activeUser)
				)}`,
			pass,
		}
	},

	toOnlyContainActiveUsers(received: ActiveUser[], ...expectedUsers: ActiveUser[]) {
		const pass =
			expectedUsers.every(expectedUser =>
				received.some(receivedUser => this.equals(receivedUser, expectedUser))
			) && received.every(receivedUser => expectedUsers.some(user => this.equals(receivedUser, user)))

		return {
			message: () =>
				`Expected ActiveUser array to only contain the received ActiveUser user array.\n${this.utils.diff(
					received.map(formatActiveUser),
					expectedUsers.map(formatActiveUser)
				)}`,
			pass,
		}
	},

	toContainSingle(received: unknown[], expectedItem: unknown) {
		const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(expectedItem)]))
		return {
			message: () => `Expected  .\n${this.utils.diff(received, [expectedItem])}`,
			pass,
		}
	},
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
})
