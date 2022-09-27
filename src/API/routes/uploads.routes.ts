import { Router } from 'express'
import { Mongo } from '../../db/mongo'

import { NOT_FOUND, sendDefaultMessage } from '../../messages/defaults'

import { Routes } from '../classes/routes'

export class UploadsRoutes extends Routes {
  defineRoutes(router: Router) {
    router.route('/:id/:filename').get(async (req, res) => {
      let found: any = await Mongo.Uploads.findOne({
        _id: Mongo.ObjectId(req.params.id),
        filename: req.params.filename,
      })
      if (!found) return sendDefaultMessage(res, new NOT_FOUND())
      try {
        const readStream = await Mongo.Uploads.read({ _id: found._id })
        if (!readStream) return res.status(404).send()
        res.set({
          'content-type': found.contentType,
          'Last-modified': found.updatedAt.toUTCString(),
        })
        readStream.on('data', (chunk) => {
          res.write(chunk)
        })
        readStream.on('end', () => {
          res.status(200).end()
        })
        readStream.on('error', (err) => {
          console.error(err)
          res.status(500).send(err)
        })
      } catch (e) {
        console.error(e)
        return res.status(500).send()
      }
    })
  }
}
