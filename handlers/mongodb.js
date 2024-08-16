import { MongoClient } from 'mongodb'
import { log } from '../functions'

const config = process.env.PRODUCTION
  ? require('../server-config')
  : require('../config')

let client

export default {
  startClient: async () => {
    log('Started connecting to MongoDB...', 'info')

    client = new MongoClient(
      process.env.MONGODB_URI || config.handler.mongodb.uri
    )

    client = client.db(config.db.name)

    log('MongoDB is connected to the atlas!', 'done')

    return client
  },
  getClient: () => client,
}
