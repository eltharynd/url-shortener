import * as Mongoose from 'mongoose'
import environment from '../environment'
import { createModel } from 'mongoose-gridfs'

export class Mongo {
  private database: Mongoose.Connection
  static Uploads

  async connect(): Promise<boolean> {
    if (this.database) return true

    return new Promise<boolean>(async (resolve, reject) => {
      Mongoose.connect(environment.mongoConnectionString)

      this.database = Mongoose.connection
      this.database.on('error', console.error.bind(console, 'connection error'))
      this.database.once('open', async () => {
        Mongo.Uploads = createModel({
          modelName: 'Upload',
          connection: this.database,
          metadata: { userId: Mongoose.Types.ObjectId, usages: 1 },
        })
        resolve(true)
      })
    })
  }

  async disconnect() {
    if (!this.database) return true
    return new Promise<boolean>(async (resolve, reject) => {
      Mongoose.disconnect()
        .then(() => resolve(true))
        .catch((err) => {
          console.error(err)
          reject(false)
        })
    })
  }

  static ObjectId(id: string): Mongoose.Types.ObjectId
  static ObjectId(id: Mongoose.Types.ObjectId): Mongoose.Types.ObjectId
  static ObjectId(
    id: string | Mongoose.Types.ObjectId
  ): Mongoose.Types.ObjectId {
    if (typeof id === 'string')
      if (id.length === 24) return new Mongoose.Types.ObjectId(id)
      else return null
    else return id
  }
}
