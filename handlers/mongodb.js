import { MongoClient } from 'mongodb'
import config from '../configurations.js'
import { log } from '../functions.js'

let client

export default {
  startClient: async () => {
    log('Connecting to MongoDB...', 'info')

    client = new MongoClient(
      process.env.MONGODB_URI || config.handler.mongodb.uri
    )

    client = client.db(config.db.name)

    log('Connected to MongoDB!', 'done')

    return client
  },
  getClient: () => client,
}
