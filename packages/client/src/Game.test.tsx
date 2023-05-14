import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"

test("Something", () => {
	render(<Game />)
	// find 20x20 cells by test id regex
	const cells = screen.getAllByTestId(/cell-\d+-\d+/)

	expect(cells.length).toBe(400)
})

function Game() {
	// render a 20x20 grid of cells with test ids
	return
}
