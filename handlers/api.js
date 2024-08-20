import express from 'express'
import fs from 'fs'
import path from 'path'
import { log } from '../functions.js'

let app
let appServer

export default async (client) => {
  app = express()

  const apiDir = client.__dirname + '/api/'
  const apiFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith('.js'))

  app.set('views', path.join(client.__dirname, '/static'))
  app.set('view engine', 'ejs')
  app.use(express.static('./static'))

  for (const file of apiFiles) {
    const module = await import(apiDir + file)
    if (!module) {
      log(
        `Failed to load module '${file}' due to an unknown import error.`,
        'warn'
      )

      continue
    }

    const middleware = module?.default
    if (!middleware) {
      log(
        "Unable to load middleware '" +
          file +
          "' due to missing 'default' export.",
        'warn'
      )

      continue
    } else if (typeof middleware !== 'function') {
      log(
        "Unable to load middleware '" +
          file +
          "' due to 'default' export not being a function.",
        'warn'
      )

      continue
    }

    try {
      app.use('/', middleware)
    } catch (err) {
      log(
        "Unable to load middleware '" +
          file +
          "' due to an error while loading.",
        'warn'
      )
      log(err, 'error')
    }
  }

  appServer = app.listen(4804, () => {
    log('Server started: Listening on port 4804', 'info')
  })
}
