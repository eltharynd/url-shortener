import { Express } from '../api/express'
import { SocketIO } from '../api/socket'
import { Mongo } from '../mongo'

class _Context {
  mongo: Mongo
  express: Express
  socket: SocketIO
}

export const Context = new _Context()

export default {
  mongo: Mongo,
  express: Express,
  socket: SocketIO,
}
