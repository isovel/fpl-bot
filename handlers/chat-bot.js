import tmi from 'tmi.js'
import { LiveChat } from 'youtube-chat'
import config from '../configurations.js'
import { log } from '../functions.js'

const ytClient = new LiveChat({ channelId: config.streaming.youtube.channelId })
const ttvClient = new tmi.Client({
  channels: [config.streaming.twitch.channelId],
})

ytClient.on('start', (liveId) =>
  log(`Started watching live chat for ${liveId}`, 'chatbot')
)

ytClient.on('chat', (chatItem) =>
  log(`${chatItem.author.name}: ${chatItem.message}`, 'chatbot')
)

ytClient.on('error', (err) => log(err, 'err'))

ytClient.on('end', (reason) => log(reason, 'warning'))

ttvClient.on('connected', () =>
  log(`Connected to ${config.streaming.twitch.channelId}'s chat.`, 'chatbot')
)

ttvClient.on('message', (channel, tags, message, self) =>
  log(`${tags['display-name']}: ${message}`, 'chatbot')
)

if (!ytClient.start())
  log('Failed to start ytClient, check emitted error', 'err')

ttvClient.connect().catch((err) => log(err, 'err'))
