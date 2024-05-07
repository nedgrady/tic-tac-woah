export function single<TItem>(array: TItem[], predicate: (item: TItem) => boolean): TItem {
	if (array.length !== 1) {
		throw new Error(`Expected exactly one item, but got ${array.length}`)
	}
	return array[0]
}
