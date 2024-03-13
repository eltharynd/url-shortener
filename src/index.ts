import fs from 'fs'
import 'reflect-metadata'
import { install } from 'source-map-support'
import { Express } from './api/express'
import environment from './environment'
import { Mongo } from './mongo'
import { Context } from './util/context'
import Logger from './util/logger'
install()

let startApp = async () => {
  if (!fs.existsSync('.env') && !process.env.OPEN_AI_API_KEY) {
    Logger.error(
      `Couldn't load environment configuration... Make sure you created the appropriate .env file...`
    )
    return process.exit(-1)
  }

  let mongo: Mongo

  let gracefulClose = async () => {
    try {
      Logger.info('GRACEFULLY QUITTING APPLICATION...')

      //SAFE CLOSE
      if (mongo) await mongo.disconnect()

      Logger.info('GRACEFULLY CLOSED APPLICATION...')
      process.exit(0)
    } catch (error) {
      Logger.error('COULD NOT GRACEFULLY CLOSE APPLICATION...')
      Logger.error(error)
    }
  }
  process.on('SIGINT', gracefulClose)
  process.on('SIGTERM', gracefulClose)

  try {
    Logger.info('STARTING APPLICATION...')

    Logger.info('CONNECTING TO DATABASE...')
    Context.mongo = new Mongo()
    await Context.mongo.connect()

    Logger.info('INITIALIZING EXPRESS SERVER...')
    Context.express = new Express()

    Logger.info(`ATTEMPTING TO LISTEN ON PORT ${environment.PORT}...`)
    await Context.express.start()

    Logger.info('APPLICATION STARTED SUCCESSFULLY...')
  } catch (e) {
    Logger.error('APPLICATION COULD NOT BE STARTED...')
    Logger.error(e)
    gracefulClose()
  }
}
startApp()
