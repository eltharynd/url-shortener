import { Router } from 'express'
import environment from '../../environment'

export abstract class Routes {
  constructor(prefix, app) {
    let router = Router()
    this.defineRoutes(router)
    app.use(`${environment.API_BASE}${prefix}`, router)
  }

  abstract defineRoutes(router: Router)
}
