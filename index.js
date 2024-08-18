import 'dotenv/config'
import ExtendedClient from './class/ExtendedClient.js'

const client = new ExtendedClient(process.cwd())

process.client = client

client.start()

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error)
process.on('uncaughtException', console.error)
process.on('warning', (warning) => {
  console.log(warning.stack)
})
