import { Button } from "@mui/material"
import MuiLink from "@mui/material/Link"

import { createLink } from "@tanstack/react-router"

export const Link = createLink(MuiLink)

export const ButtonLink = createLink(Button)
