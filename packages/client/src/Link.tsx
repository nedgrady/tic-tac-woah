import Button from "@mui/material/Button"
import { Link as TanstackLink, LinkOptions, MakeLinkOptions } from "@tanstack/react-router"
import { ReactPropsWithChildren } from "./logging/ErrorBoundary"

interface ButtonLinkProps extends MakeLinkOptions {
	children: string
}

export default function ButtonLink(props: ButtonLinkProps) {
	return (
		<TanstackLink to={props.to} params={{}} search={{}}>
			<Button component="span">{props.children}</Button>
		</TanstackLink>
	)
}
