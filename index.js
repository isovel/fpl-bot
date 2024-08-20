import 'dotenv/config'
import ExtendedClient from './class/ExtendedClient.js'
import { log } from './functions.js'

const client = new ExtendedClient(process.cwd())

process.client = client

client.start()

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', (reason) => {
  log(reason instanceof Error ? reason.stack : reason, 'err')
})

process.on('uncaughtException', (error) => {
  log(error.stack, 'err')
})

process.on('warning', (warning) => {
  log(warning.stack, 'warn')
})
