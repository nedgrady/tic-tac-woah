import { renderHook, act } from "@testing-library/react"
import { useState } from "react"
import { ArrayIndex } from "types"

import { expect, test } from "vitest"
import { useSelectedDiff, SelectionState } from "./useSelectedDiff"

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
