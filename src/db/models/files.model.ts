import { ReadStream } from 'fs'
import { Schema, model, Types, Model } from 'mongoose'
import * as multer from 'multer'

interface IFileMetadata {
  //userId?: Types.ObjectId
  //usages?: number
  //Define your metadata here

  url?: string
}

interface IFileModel {
  findOne(filters: {}): IFile
  find(filters?: {}): Array<IFile>
}
interface IFile {
  _id?: Types.ObjectId
  filename: string
  metadata?: IFileMetadata
  contentType?: string
  disableMD5?: boolean
  aliases?: Array<string>
  chunkSizeBytes?: number
  start?: number
  end?: number
  revision?: number

  save(): Promise<any>
}

export const fileSchema: Schema = new Schema({
  _id: Types.ObjectId,
  filename: String,
  metadata: {
    type: Object,
    required: true,
  },
  contentType: String,
  disableMD5: Boolean,
  aliases: [String],
  chunkSizeBytes: Number,
  start: Number,
  end: Number,
  revision: Number,
})

//@ts-ignore
export interface GridfsModel<
  T,
  TQueryHelpers,
  TMethodsAndOverrides = {},
  TVirtuals = {}
> extends Model<T, TQueryHelpers, TMethodsAndOverrides, TVirtuals> {
  write(options, readStream, callback: (error, file) => {})
  read(findOne: object): ReadStream
  read(findOne: object, callback: (error, buffer) => void)
  unlink(findOne: object, callback: (error, buffer) => void)

  findOne(filters: object): IUpload
  find(filters?: object): Array<IUpload>
}
export interface IUpload {
  _id?: Types.ObjectId
  filename: string
  metadata?: IFileMetadata
  contentType?: string
  disableMD5?: boolean
  aliases?: Array<string>
  chunkSizeBytes?: number
  start?: number
  end?: number
  revision?: number

  save(): Promise<any>
}

//@ts-ignore
export const Files: IFileModel = model<IFile>('Uploads.files', fileSchema)

export const filesMiddleware = multer({
  storage: multer.memoryStorage(),
}).single('file')
