import { Controller, Get, Post, Req, UseBefore } from 'routing-controllers'
import ShortUniqueId from 'short-unique-id'
import { Readable } from 'stream'
import environment from '../../environment'
import { Mongo } from '../../mongo'
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from '../interceptors/default.interceptor'
import { uploadsMiddleware } from '../middlewares/multer.middleware'

const { randomUUID } = new ShortUniqueId({ length: 8 })

@Controller(`/uploads`)
export class UploadsController {
  @Post(`/`)
  @UseBefore(uploadsMiddleware)
  async upload(@Req() req: any) {
    if (!req.file)
      throw new BAD_REQUEST(`You didn't send a file with your request...`)

    if (!/^image\//.test(req.file.mimetype))
      throw new BAD_REQUEST(`Only accepts images`)

    let readStream = Readable.from(req.file.buffer)

    return await new Promise<string>(async (resolve, reject) => {
      readStream.on('error', (e) => {
        reject(new INTERNAL_SERVER_ERROR(e))
      })

      let slug = randomUUID()
      let stream = Mongo.Uploads.openUploadStream(req.file.originalname, {
        chunkSizeBytes: 1048576,
        metadata: {
          slug,
          originalname: req.file.originalname,
          contentType: req.file.mimetype,
        },
      }).on('finish', () => {
        if (!stream.errored)
          resolve(
            `${
              environment.DOMAIN === 'localhost'
                ? `http://localhost:${environment.PORT}/`
                : `https://${environment.DOMAIN}/`
            }${slug}`,
          )
      })

      readStream.pipe(stream)
    })
  }

  @Get(`/`)
  async uploaded() {
    return `${(await Mongo.Uploads.find({}).toArray()).length}`
  }
}
