import * as Colyseus from "colyseus.js" // not necessary if included via <script> tag.

var client = new Colyseus.Client("ws://server-0mi6.onrender.com:8080")

client
	.joinOrCreate("room_name")
	.then(room => {
		console.log(room.sessionId, "joined", room.name)
	})
	.catch(e => {
		console.log("JOIN ERROR", e)
	})

function App() {
	document.title = `${document.title} (${__COMMIT_HASH__})`
	return <>👀</>
}

export default App
