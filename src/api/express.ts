import express from 'express'
import fs from 'fs'
import { createServer, Server } from 'http'
import path from 'path'
import environment from '../environment'
import { Links } from './links/links.model'
require('express-async-errors')

import { createExpressServer } from 'routing-controllers'
import { Mongo, MongoInterceptor } from '../mongo'
import Logger from '../util/logger'
import { DefaultInterceptor } from './interceptors/default.interceptor'
import { LinksController } from './links/links.controller'
import { HttpErrorHandler } from './middlewares/error.middleware'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { UploadsController } from './uploads/uploads.controller'

//__dirname = './page/dist/page'
export class Express {
  origins = environment.PRODUCTION
    ? [`https://${environment.DOMAIN}`]
    : [
        'http://localhost:4200',
        `http://localhost:${environment.PORT}`,
        `https://${environment.DOMAIN}`,
      ]

  app: express.Express
  server: Server

  constructor() {
    this.app = createExpressServer({
      cors: {
        origin: this.origins,
        optionsSuccessStatus: 200,
        credentials: true,
      },
      routePrefix: environment.API_BASE.replace(/\/$/, ''),
      defaultErrorHandler: false,
      middlewares: [LoggerMiddleware, HttpErrorHandler],
      controllers: [LinksController, UploadsController],
      interceptors: [DefaultInterceptor, MongoInterceptor],
      validation: { whitelist: true },
      classToPlainTransformOptions: {
        enableCircularCheck: true,
      },
    })

    this.app.set('trust proxy', true)

    this.server = createServer(this.app)

    this.app.use('*', async (req, res, next) => {
      if (/^\/api/g.test(req.originalUrl)) return next()

      try {
        let link = await Links.findOne({
          slug: req.originalUrl.replace(/^\//, ''),
        })

        if (link) return res.redirect(301, link.url)
      } catch {}

      try {
        let file = await Mongo.Uploads.find({
          'metadata.slug': req.originalUrl.replace(/^\//, ''),
        }).toArray()
        if (file?.length > 0) {
          return next()
        }
      } catch {}

      let base = path.join(process.cwd(), `page${path.sep}dist${path.sep}page`)
      let proxied = path.join(base, req.originalUrl.replace(/\//i, path.sep))
      if (!/\/$/i.test(req.originalUrl) && fs.existsSync(proxied)) {
        return res.sendFile(proxied)
      } else return res.sendFile(path.join(base, `${path.sep}index.html`))
    })
  }

  async start(portOverride?: number): Promise<Server> {
    return new Promise<Server>((resolve, reject) => {
      this.server.listen(portOverride || environment.PORT)
      this.server.on('error', (error) => {
        Logger.error(error)
        reject(error)
      })
      this.server.on('listening', () => resolve(this.server))
    })
  }
}
