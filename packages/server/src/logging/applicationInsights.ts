import * as applicationInsights from "applicationinsights"
import debug from "debug"
import os from "os"

applicationInsights
	.setup(
		"InstrumentationKey=691cf8f7-d5ef-45df-a5ff-385d9429be4b;IngestionEndpoint=https://uksouth-1.in.applicationinsights.azure.com/;LiveEndpoint=https://uksouth.livediagnostics.monitor.azure.com/"
	)
	.setAutoCollectConsole(true, false)
	.start()

applicationInsights.defaultClient.context.tags[applicationInsights.defaultClient.context.keys.cloudRole] =
	"tic-tac-woah.server"
applicationInsights.defaultClient.context.tags[
	applicationInsights.defaultClient.context.keys.cloudRoleInstance
] = `${os.hostname()}`

applicationInsights.defaultClient.commonProperties = {
	"tic-tac-woah.source": "default",
}

debug.log = (message: never, ...args: never[]) => {
	console.log(message)
	console.log(typeof message)
	applicationInsights.defaultClient.trackTrace({
		message: message,
		properties: {
			...args,
			"tic-tac-woah.source": "debug",
		},
	})

	applicationInsights.defaultClient.flush()
}

export default applicationInsights.defaultClient
