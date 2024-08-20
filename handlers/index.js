import api from './api.js'
// import * as chatBot from './chat-bot.js'
import * as chat from './chat.js'
import commands from './commands.js'
import components from './components.js'
import deploy from './deploy.js'
import events from './events.js'
import * as leaderboard from './leaderboard.js'
import * as matchCalculations from './matchCalculations.js'
import mongodb from './mongodb.js'
import * as notifications from './notifications.js'
import * as permissions from './permissions.js'

// Re-export all handlers
export {
  api,
  chat,
  // chatBot,
  commands,
  components,
  deploy,
  events,
  leaderboard,
  matchCalculations,
  mongodb,
  notifications,
  permissions,
}
