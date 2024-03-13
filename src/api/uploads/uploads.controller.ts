import { Request, Response } from 'express'
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseBefore,
} from 'routing-controllers'
import ShortUniqueId from 'short-unique-id'
import { Readable } from 'stream'
import environment from '../../environment'
import { Mongo } from '../../mongo'
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from '../interceptors/default.interceptor'
import { uploadsMiddleware } from '../middlewares/multer.middleware'

const { randomUUID } = new ShortUniqueId({ length: 8 })

@Controller(`/uploads`)
export class UploadsController {
  @Get(`/:fileId`)
  async download(
    @Req() req: Request,
    @Res() res: Response,
    @Param('fileId') fileId: string
  ) {
    let files = await Mongo.Uploads.find({
      'metadata.slug': fileId,
    }).toArray()

    if (files?.length > 0) {
      let file = files[0]
      return new Promise<Response>((resolve, reject) => {
        let readStream = Mongo.Uploads.openDownloadStream(file._id)

        res.set({
          'Content-Disposition': `attachment; filename="${file.metadata.originalname}"`,
          'content-type': file.metadata.contentType,
          'Last-modified': file.uploadDate.toUTCString(),
        })
        readStream.on('error', (e) => {
          reject(new INTERNAL_SERVER_ERROR(e))
        })
        readStream.on('end', () => {
          resolve(res)
        })

        readStream.pipe(res)
      })
    } else throw new NOT_FOUND()
  }

  @Post(`/`)
  @UseBefore(uploadsMiddleware)
  async upload(@Req() req: any) {
    if (!req.file)
      throw new BAD_REQUEST(`You didn't send a file with your request...`)

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
                ? `http://localhost:${environment.PORT}${environment.API_BASE}`
                : `https://${environment.DOMAIN}${environment.API_BASE}`
            }${slug}`
          )
      })

      readStream.pipe(stream)
    })
  }
}
