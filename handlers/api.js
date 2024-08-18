import express from 'express'
import fs from 'fs'
import path from 'path'
import { log } from '../functions.js'

let app

export default async (client) => {
  app = express()

  const apiDir = client.__dirname + '/api/'
  const apiFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith('.js'))

  app.set('views', path.join(client.__dirname, '/static'))
  app.set('view engine', 'ejs')
  app.use(express.static('./static'))

  for (const file of apiFiles) {
    const module = require(apiDir + file)

    if (!module) continue

    app.use('/', module)
  }

  appServer = app.listen(4804, () => {
    log('Server started: Listening on port 4804', 'info')
  })
}
