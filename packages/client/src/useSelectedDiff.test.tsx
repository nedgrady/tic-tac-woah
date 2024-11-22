import { renderHook, act, render, screen } from "@testing-library/react"
import { beforeAll, beforeEach, expect, test } from "vitest"
import { useSelectedDiff, SelectionState } from "./useSelectedDiff"
import { Button } from "@mui/material"

test("initially returns nothing selected or hovered", () => {
	const { result } = renderHook(() => useSelectedDiff(3))

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

test("initially returns nothing selected or hovered 2", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

test("selecting the final index returns all items selected", () => {
	const { result } = renderHook(() => useSelectedDiff(3))

	act(() => {
		result.current.selectEntity(1)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"remainsSelected",
		"remainsUnselected",
	])
})

test("selecting the final index, then the second deselects the final index", () => {
	const { result } = renderHook(() => useSelectedDiff(3))

	act(() => {
		result.current.selectEntity(2)
	})

	act(() => {
		result.current.selectEntity(1)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"remainsSelected",
		"remainsUnselected",
	])
})

test("selecting the first index, then the last index returns all items selected", () => {
	const { result } = renderHook(() => useSelectedDiff(3))

	act(() => {
		result.current.selectEntity(0)
	})

	act(() => {
		result.current.selectEntity(2)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"remainsSelected",
		"remainsSelected",
	])
})

test("hovering over the last index returns all items tentatively selected", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.hoverOverEntity(4)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"tentativelySelected",
		"tentativelySelected",
		"tentativelySelected",
		"tentativelySelected",
		"tentativelySelected",
	])
})

test("hovering over the last index then the second index", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.hoverOverEntity(4)
	})

	act(() => {
		result.current.hoverOverEntity(1)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"tentativelySelected",
		"tentativelySelected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

test("selecting first item then hovering over the last item", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.selectEntity(0)
	})

	act(() => {
		result.current.hoverOverEntity(4)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"tentativelySelected",
		"tentativelySelected",
		"tentativelySelected",
		"tentativelySelected",
	])
})

test("selecting last item then hovering over the first item", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.selectEntity(4)
	})

	act(() => {
		result.current.hoverOverEntity(0)
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"tentativelyUnselected",
		"tentativelyUnselected",
		"tentativelyUnselected",
		"tentativelyUnselected",
	])
})

test("resetting the hover returns the previous selected states", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.hoverOverEntity(4)
	})

	act(() => {
		result.current.resetHover()
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

test("resetting the selected entities returns to the initial state", () => {
	const { result } = renderHook(() => useSelectedDiff(5))

	act(() => {
		result.current.selectEntity(4)
	})

	act(() => {
		result.current.resetSelections()
	})

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

test("allow an optional initial index", () => {
	const { result } = renderHook(() => useSelectedDiff(3, 0))

	expect(result.current.selections).toEqual<SelectionState[]>([
		"remainsSelected",
		"remainsUnselected",
		"remainsUnselected",
	])
})

// test("When the 'cancel' button is clicked, onClose is called", () => {
// 	render(
// 		<CustomModal
// 			onClose={reason => {
// 				expect(reason).toBe("clicked cancel")
// 			}}
// 		/>,
// 	)

// 	const button = screen.getByRole("button", { name: /Cancel/i })
// 	userEvent.click(button)
// })

// test("When the 'cancel' button is clicked, onClose is called", () => {
// 	const mockOnClose = vi.fn()

// 	render(<CustomModal onClose={mockOnClose} />)

// 	const button = screen.getByRole("button", { name: /Cancel/i })
// 	userEvent.click(button)

// 	expect(mockOnClose).toHaveBeenCalledWith("clicked cancel")
// })

// type ModalResponse = "clicked ok" | "clicked cancel"
// interface CustomModalProps {
// 	onClose: (reason: ModalResponse) => void
// }
// function CustomModal({ onClose }: CustomModalProps) {
// 	return (
// 		<div>
// 			<div>Some modal content</div>
// 			<div>
// 				<button onClick={onClose}>OK</button>
// 				<button onClick={onClose}>Cancel</button>
// 			</div>
// 		</div>
// 	)
// }

beforeEach(() => {
	const webSocketManager = new WebSocketManager()

	expect(webSocketManager.connectedSockets).toEqual([])
})

function calculate(input: string) {
	if (input === "") {
		return 4
	}
	return 4
}

class WebSocketManager {
	public connectedSockets: WebSocket[] = []
	constructor() {}
}
