import { expect } from "vitest"
import * as matchers from "jest-extended"
import { ActiveUser } from "TicTacWoahSocketServer"
import { Socket } from "socket.io-client"
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

		const diff = this.utils.diff(received.map(formatActiveUser), formatActiveUser(activeUser))

		return {
			message: () => `Expected ActiveUser array to contain the received ActiveUser\n. ${diff}`,
			pass,
		}
	},

	toOnlyContainActiveUsers(received: ActiveUser[], ...expectedUsers: ActiveUser[]) {
		const receivedFmt = received.map(receivedUser => ({
			uniqueIdentifier: receivedUser.uniqueIdentifier,
			connections: receivedUser.connections.size,
		}))

		const activeUsersFmt = expectedUsers.map(expectedUser => ({
			uniqueIdentifier: expectedUser.uniqueIdentifier,
			connections: expectedUser.connections.size,
		}))

		const pass =
			expectedUsers.every(expectedUser =>
				received.some(receivedUser => this.equals(receivedUser, expectedUser))
			) && received.every(receivedUser => expectedUsers.some(user => this.equals(receivedUser, user)))

		return {
			message: () => `Expected ${receivedFmt} to ${this.isNot ? "not" : ""} contain exactly ${activeUsersFmt}`,
			pass,
		}
	},
})
