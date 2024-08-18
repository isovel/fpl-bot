import 'dotenv/config'
import devConfig from './config.js'
import prodConfig from './server-config.js'

let config = process.env.PRODUCTION ? prodConfig : devConfig

export default config
