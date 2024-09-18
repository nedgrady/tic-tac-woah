import { useState } from "react"
import { ArrayIndex } from "types"

export type SelectionState = "remainsUnselected" | "remainsSelected" | "tentativelySelected" | "tentativelyUnselected"

export function useSelectedDiff(countOfEntities: number): {
	selections: SelectionState[]
	selectEntity: (index: number) => void
	hoverOverEntity: (index: number) => void
	resetHover: () => void
} {
	const [selectedIndex, setSelectedIndex] = useState<ArrayIndex | null>(null)
	const [hoveredIndex, setHoveredIndex] = useState<ArrayIndex | null>(null)

	function state(): SelectionState[] {
		// no hovers or selections
		if (hoveredIndex === null && selectedIndex === null) return new Array(countOfEntities).fill("remainsUnselected")

		// hover with no selections
		if (hoveredIndex != null && selectedIndex === null) {
			// if no hover, then respect the current selected items always
			const state = unselected(countOfEntities)

			for (let currentIndex = 0; currentIndex <= hoveredIndex; currentIndex++) {
				state[currentIndex] = "tentativelySelected"
			}

			return state
		}

		// selctions with no hover
		if (selectedIndex != null && hoveredIndex === null) {
			// if no hover, then respect the current selected items always
			const state = unselected(countOfEntities)

			for (let currentIndex = 0; currentIndex <= selectedIndex; currentIndex++) {
				state[currentIndex] = "remainsSelected"
			}

			return state
		}

		const operation = hoveredIndex! > selectedIndex! ? "adding" : "removing"

		if (operation === "adding") {
			const state = unselected(countOfEntities)

			for (let currentIndex = 0; currentIndex <= selectedIndex!; currentIndex++) {
				state[currentIndex] = "remainsSelected"
			}

			for (let currentIndex = selectedIndex! + 1; currentIndex <= hoveredIndex!; currentIndex++) {
				state[currentIndex] = "tentativelySelected"
			}

			return state
		} else {
			const state = unselected(countOfEntities)

			for (let currentIndex = 0; currentIndex <= selectedIndex!; currentIndex++) {
				state[currentIndex] = "remainsSelected"
			}

			for (let currentIndex = hoveredIndex! + 1; currentIndex <= selectedIndex!; currentIndex++) {
				state[currentIndex] = "tentativelyUnselected"
			}

			return state
		}
	}

	return {
		selections: state(),
		selectEntity: setSelectedIndex,
		hoverOverEntity: setHoveredIndex,
		resetHover: () => setHoveredIndex(null),
	}
}

function unselected(count: number): SelectionState[] {
	return new Array(count).fill("remainsUnselected")
}
