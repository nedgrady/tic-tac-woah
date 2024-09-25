import { ReactNode } from "react"

export interface HumanParticipantPositionProps {
	actionIcon: ReactNode
	fill?: string
}

export function HumanParticipant({ actionIcon, fill }: HumanParticipantPositionProps) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill}>
			<path d="M13.82,18.78a5.51,5.51,0,0,1,4-5.27,9.85,9.85,0,0,0-3.52-2.27,6.49,6.49,0,0,1-8.2,0C2.61,12.57.2,15.52.2,19a1.41,1.41,0,0,0,.44,1,4.59,4.59,0,0,0,1.43.93,21.48,21.48,0,0,0,8.09,1.29,29.33,29.33,0,0,0,4.57-.34A5.48,5.48,0,0,1,13.82,18.78Z" />
			<path d="M4.73,6.2A5.42,5.42,0,0,0,6.31,10a4.83,4.83,0,0,0,.49.41,4.39,4.39,0,0,0,.56.4,5.3,5.3,0,0,0,5.6,0,5.23,5.23,0,0,0,.56-.4A4.83,4.83,0,0,0,14,10,5.42,5.42,0,1,0,4.73,6.2Z" />
			{actionIcon}
		</svg>
	)
}
