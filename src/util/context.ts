import { Express } from '../api/express'
import { Mongo } from '../mongo'

class _Context {
  mongo: Mongo
  express: Express
}

export const Context = new _Context()

export default {
  mongo: Mongo,
  express: Express,
}
