import { useNavigate } from "@tanstack/react-router"
import Button from "@mui/material/Button"

export function Home() {
	const navigate = useNavigate()

	return <Button onClick={() => navigate({ to: "/queue" })}>Play Now</Button>
}
