import { expect, test } from "vitest"
import { render, screen } from "@testing-library/react"

test("Something", () => {
	render(<Game />)
	// find 20x20 cells by test id regex
	const cells = screen.getAllByTestId(/cell-\d+-\d+/)

	expect(cells.length).toBe(400)
})

function Game() {
	const cells = Array.from({ length: 20 }, (_, y) => (
		<div>
			{Array.from({ length: 20 }, (_, x) => (
				<div key={`cell-${x}-${y}`} data-testid={`cell-${x}-${y}`} />
			))}
		</div>
	))

	return <div>{cells}</div>
}
