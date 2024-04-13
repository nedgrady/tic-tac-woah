import { ActiveUser, TicTacWoahSocketServerMiddleware } from "TicTacWoahSocketServer"
import { EventEmitter } from "events"
import _ from "lodash"

export type QueueAddedListener = (queueState: readonly ActiveUser[]) => void

export interface QueueItem {
	queuer: ActiveUser
	humanCount: number
}

export class TicTacWoahQueue {
	readonly #queue: ActiveUser[] = []
	readonly #emitter: EventEmitter = new EventEmitter()
	objectId: string
	private _items: QueueItem[] = []

	constructor() {
		this.objectId = crypto.randomUUID()
	}

	add(newUser: ActiveUser) {
		if (
			this.#queue.findIndex(
				userInQueueAlready => userInQueueAlready.uniqueIdentifier === newUser.uniqueIdentifier
			) !== -1
		)
			return
		this.#queue.push(newUser)
		this.#emitter.emit("Added", [...this.#queue])
	}

	onAdded(listener: QueueAddedListener) {
		this.#emitter.on("Added", listener)
	}

	remove(user: ActiveUser) {
		const id = user.uniqueIdentifier
		const index = this.#queue.findIndex(u => u.uniqueIdentifier === id)
		if (index === -1) return
		this.#queue.splice(index, 1)

		const queueItemToRemove = this._items.find(item => item.queuer.uniqueIdentifier === id)
		if (queueItemToRemove) {
			_.remove(this._items, queueItemToRemove)
		}
	}

	get users(): readonly ActiveUser[] {
		return this.#queue
	}

	addItem(item: QueueItem) {
		this._items.push(item)
	}

	get items(): readonly QueueItem[] {
		return this._items
	}
}

export function addConnectionToQueue(queue: TicTacWoahQueue): TicTacWoahSocketServerMiddleware {
	return (socket, next) => {
		socket.on("joinQueue", (joinQueueRequest, callback) => {
			queue.add(socket.data.activeUser)
			const queueItem: QueueItem = {
				queuer: socket.data.activeUser,
				humanCount: joinQueueRequest.humanCount,
			}

			queue.addItem(queueItem)
			callback && callback(0)
		})

		next()
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function loggedMethod(_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value

	function replacementMethod(this: any, ...args: any[]) {
		if (isActiveUser(args[0])) {
			console.log(`Active user: ${args[0].uniqueIdentifier}`)
		}

		console.log(`Calling ${_propertyKey} with`, args)
		const result = originalMethod.apply(this, args)

		return result
	}

	descriptor.value = replacementMethod
	return descriptor

	function isActiveUser(value: any): value is ActiveUser {
		return (
			typeof value === "object" &&
			value !== null &&
			value.connections instanceof Set &&
			typeof value.uniqueIdentifier === "string" &&
			(typeof value.objectId === "string" || typeof value.objectId === "undefined")
		)
	}
}
/* eslint-enable @typescript-eslint/no-explicit-any */
