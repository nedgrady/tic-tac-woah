export class ThrowingIterator<TEntityToReturn> {
	private iterator: Iterator<TEntityToReturn>

	constructor(
		private readonly entities: readonly TEntityToReturn[],
		private readonly entityName: string,
	) {
		this.iterator = entities[Symbol.iterator]()
	}

	next(): TEntityToReturn {
		const { value: currentEntity, done } = this.iterator.next()

		if (done) throw new Error(`No more entities of type ${this.entityName} to return`)

		return currentEntity
	}
}
