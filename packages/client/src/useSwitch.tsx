import { useState } from "react"

export function useSwitch(initialState: boolean) {
	const [checked, setChecked] = useState(initialState)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked)
	}

	return { checked, handleChange } as const
}
