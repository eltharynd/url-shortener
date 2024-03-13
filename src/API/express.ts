import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import { createServer, Server } from 'http'
import path from 'path'
import environment from '../environment'
require('express-async-errors')

import ShortUniqueId from 'short-unique-id'
const uid = new ShortUniqueId({ length: 8 })

import { INTERNAL_SERVER_ERROR, sendDefaultMessage } from '../messages/defaults'

import { Links } from '../db/models/links.model'

__dirname = './page/dist/page'
export class Express {
  app: express.Express
  server: Server

  static origins: string[]

  constructor() {
    this.app = express()
    Express.origins = [
      'http://localhost:3000',
      'http://localhost:4200',
      'http://localhost:8000',
    ]
    if (environment.PRODUCTION) {
      Express.origins = [
        `https://${environment.DOMAIN}`,
        `https://production.${environment.DOMAIN}`,
      ]
    } else {
      Express.origins.push(`https://${environment.DOMAIN}`)
      Express.origins.push(`https://production.${environment.DOMAIN}`)
      Express.origins.push(`https://staging.${environment.DOMAIN}`)
    }
    this.app.use(
      cors({
        origin: Express.origins,
        optionsSuccessStatus: 200,
        credentials: true,
      })
    )
    this.app.set('trust proxy', true)
    this.app.use(
      express.json({
        verify: (req: any, res, buff) => {
          req.rawBody = buff
        },
      })
    )
    this.app.use(cookieParser())

    //new UploadsRoutes('uploads', this.app)

    //THIS IS WHERE YOUR CUSTOM ROUTE CONTROLLERS GO

    //TODO add the rest of it from v1
    //TODO test data generation (DB init) for all of them

    let staticRoot = __dirname + '/'
    this.app.use(async function (req, res, next) {
      if (/^\/[\d\w]*/i.test(req.path)) {
        let slug = req.path.replace(/^\//, '').replace(/\/.*$/, '')
        if (slug === 'create') return next()

        let link = await Links.findOne({ slug: slug })
        if (link) {
          return res.redirect(301, link.url)
        }
      }
      //if the request is not html then move along
      var accept = req.accepts('html', 'json', 'xml')
      if (accept !== 'html') {
        return next()
      }
      // if the request has a '.' assume that it's for a file, move along
      var ext = path.extname(req.path)
      if (ext !== '') {
        return next()
      }
      fs.createReadStream(staticRoot + 'index.html').pipe(res)
    })

    this.app.use(express.static(staticRoot))

    this.app.use(express.static('../page/dist/page'))
    this.app.set('view engine', 'pug')
    this.app.get('/', (req, res) => {
      res.sendfile('index.html', { root: __dirname })
    })

    this.app.post('/create', async (req, res) => {
      if (
        !/(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(
          req.body.url
        )
      )
        return res.sendStatus(400)
      let link = await Links.create({ slug: uid(), url: req.body.url })

      await link.save()
      res.send(`eltha.wtf/${link.slug}`)
    })

    //END

    /* this.app.get('/ELB-HealthChecker/2.0', (req, res) =>
      res.status(200).send('ELB Health Check successful...')
    ) */

    //this.app.get('/', (req, res) => res.status(200).send('Backend reached'))

    this.app.use((err, req, res, next) => {
      if (res.headersSent) return next(err)
      sendDefaultMessage(res, new INTERNAL_SERVER_ERROR(err.message))
      next(err)
    })
  }

  async start(portOverride?: number): Promise<express.Express> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app)
      this.server.listen(portOverride || environment.PORT)
      this.server.on('error', (error) => {
        console.error(error)
        reject(error)
      })
      this.server.on('listening', () => resolve(this.app))
    })
  }
}

declare global {
  export namespace Express {
    export interface Request {
      rawBody: Buffer
    }
  }
}
