import { MongoMemoryServer } from 'mongodb-memory-server'

import mongoose from 'mongoose'
import environment from '../environment'
import Logger from '../util/logger'

export class Mongo {
  private connection: mongoose.Connection
  static Uploads //: mongoose.mongo.GridFSBucket

  async connect(): Promise<boolean> {
    if (this.connection) return true

    return new Promise<boolean>(async (resolve, reject) => {
      if (!environment.TESTING && environment.MONGO_ADDRESS) {
        mongoose
          .connect(environment.MONGO_ADDRESS, {
            auth: {
              username: environment.MONGO_USER,
              password: environment.MONGO_PASSWORD,
            },
            retryWrites: true,
            w: 'majority',
          })
          .then(({ connection }) => {
            this.connection = connection
            Mongo.Uploads = new mongoose.mongo.GridFSBucket(connection.db)
            this.connection.on('error', (e) => {
              Logger.error(e)
            })
            resolve(true)
          })
      } else {
        let mongod = await MongoMemoryServer.create()
        mongoose
          .connect(mongod.getUri())
          .then(async ({ connection }) => {
            this.connection = connection
            Mongo.Uploads = new mongoose.mongo.GridFSBucket(connection.db)
            //await Mongo.populateMockData()
            resolve(true)
          })
          .catch((e) => {
            Logger.error(e)
          })
      }
    })
  }

  async disconnect() {
    if (!this.connection) return true
    return new Promise<boolean>(async (resolve, reject) => {
      mongoose
        .disconnect()
        .then(() => resolve(true))
        .catch((e) => {
          Logger.error(e)
          reject(false)
        })
    })
  }

  isConnected(): boolean {
    return this.connection?.readyState === mongoose.ConnectionStates.connected
  }

  static ObjectId(id: string): mongoose.Types.ObjectId
  static ObjectId(id: mongoose.Types.ObjectId): mongoose.Types.ObjectId
  static ObjectId(id: mongoose.Types.ObjectId | string): mongoose.Types.ObjectId
  static ObjectId(
    id: string | mongoose.Types.ObjectId
  ): mongoose.Types.ObjectId {
    if (typeof id === 'string')
      if (id.length === 24) return new mongoose.Types.ObjectId(id)
      else return null
    else return id
  }
}
