import { ActiveUser } from "TicTacWoahSocketServer"
import { expect } from "vitest"

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

export const matchers: Parameters<(typeof expect)["extend"]>[0] = {
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
					toImportantBits(activeUser),
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
					formatActiveUser(activeUser),
				)}`,
			pass,
		}
	},

	toOnlyContainActiveUsers(received: ActiveUser[], ...expectedUsers: ActiveUser[]) {
		const pass =
			expectedUsers.every(expectedUser =>
				received.some(receivedUser => this.equals(receivedUser, expectedUser)),
			) && received.every(receivedUser => expectedUsers.some(user => this.equals(receivedUser, user)))

		return {
			message: () =>
				`Expected ActiveUser array to only contain the received ActiveUser user array.\n${this.utils.diff(
					received.map(formatActiveUser),
					expectedUsers.map(formatActiveUser),
				)}`,
			pass,
		}
	},
}
