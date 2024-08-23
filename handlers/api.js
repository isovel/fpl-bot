import chalk from 'chalk'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { log } from '../functions.js'

const appPort = 4804

let app
let appServer

export default async (client) => {
  app = express()

  const apiDir = path.join(process.cwd(), '/api')
  const staticDir = path.join(process.cwd(), '/static')

  log('Loading API routes...', 'info')
  log(`API directory: ${chalk.grey(apiDir)}`, 'debug')
  log(`Static directory: ${chalk.grey(staticDir)}`, 'debug')

  const apiFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith('.js'))

  app.set('views', staticDir)
  app.set('view engine', 'ejs')
  app.use(express.static(staticDir))

  for (const file of apiFiles) {
    const module = await import(apiDir + file)
    if (!module) {
      log(
        `Unable to load module ${chalk.grey(
          file
        )} due to an unknown import error.`,
        'warn'
      )

      continue
    }

    const middleware = module?.default
    if (!middleware) {
      log(
        `Unable to load middleware ${chalk.grey(
          file
        )} due to 'default' export not being found.`,
        'warn'
      )

      continue
    } else if (typeof middleware !== 'function') {
      log(
        `Unable to load middleware ${chalk.grey(
          file
        )} due to 'default' export not being a function.`,
        'warn'
      )

      continue
    }

    try {
      app.use('/', middleware)
    } catch (err) {
      log(
        `Unable to load middleware ${chalk.grey(file)} due to an error: ${
          err.message
        }`,
        'warn'
      )
      log(err, 'error')
    }
  }

  log('API routes loaded!', 'done')

  appServer = app.listen(appPort, () => {
    log(`Listening on ${chalk.blue('http://localhost:' + appPort)}`, 'info')
  })
}
