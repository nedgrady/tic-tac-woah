import { expect } from "vitest"
import * as matchers from "jest-extended"
import { matchers as activeUserMatchers } from "./testingUtilities/assertions/activeUser"
import { matchers as socketEventsMatchers } from "./testingUtilities/assertions/socketEvents"
import { matchers as collectionsMatchers } from "./testingUtilities/assertions/collections"

expect.extend(matchers)
expect.extend(activeUserMatchers)
expect.extend(socketEventsMatchers)
expect.extend(collectionsMatchers)
