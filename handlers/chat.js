import tmi from 'tmi.js'
import { LiveChat } from 'youtube-chat'
import config from '../configurations.js'
import { log } from '../functions.js'

let votingStartTime
let votingActive = false
let votingType // 1=map, 2=gamemode
let map
let gamemode

// Recommended
const ytClient = new LiveChat({ channelId: config.streaming.youtube.channelId })
const ttvClient = new tmi.Client({
  channels: [config.streaming.twitch.channelId],
})

/*
Bank It: All maps
Cashout: All maps
Quick Cash: All maps
Terminal Attack: All maps but no Seoul
Power Shift: No Las Vegas 
So it's just Seoul on TA. no vegas on Powershift and solo bank it we wasn't adding anyways 
*/

const modes = [
  'bank it',
  'cashout',
  'quick cash',
  'power shift',
  'terminal attack',
]

const maps = {
  monaco: modes,
  seoul: modes.filter((m) => m != 'terminal attack'),
  skyway: modes,
  vegas: modes.filter((m) => m != 'power shift'),
  horizon: modes,
  kyoto: modes,
}

let mapVotes = new Map()
let mapVotesArray

let gamemodeVotes = new Map()
let gamemodeVotesArray

function newMessage(message, author, createdAt) {
  if (!message?.startsWith('!')) return
  message = message.toLowerCase()
  if (votingActive && !message.startsWith('!v')) return
  message = message.split(' ').slice(1).join(' ')
  if (votingActive) {
    if (createdAt < votingStartTime) return
    if (votingType == 1) {
      if (Object.keys(maps).includes(message.toLowerCase())) {
        if (mapVotes.has(author)) return
        mapVotes.set(author, message)
        log(`${author} voted for ${message}`, 'chatbot')
      }
    } else {
      if (maps[map].includes(message.toLowerCase())) {
        if (gamemodeVotes.has(author)) return
        gamemodeVotes.set(author, message)
        log(`${author} voted for ${message}`, 'chatbot')
      }
    }
  }
}

ytClient.on('start', (liveId) => {
  log(`Connected to live chat for ${liveId}`, 'chatbot')
})

ytClient.on('end', (reason) => {
  log(reason, 'warning')
})

ytClient.on('chat', (chatItem) => {
  newMessage(
    chatItem.message[0].text,
    chatItem.author.name,
    new Date(chatItem.timestamp)
  )
})

ytClient.on('error', (err) => {
  log(err, 'error')
})

ttvClient.on('message', (channel, tags, message, self) => {
  newMessage(message, tags['display-name'], Date.now())
})

export default {
  startVoting: (type) => {
    return new Promise((resolve, reject) => {
      log(`Starting voting for ${type == 1 ? 'map' : 'gamemode'}`, 'chatbot')
      let ok = ytClient.start()
      if (!ok) {
        log('Failed to start ytClient, check emitted error', 'error')
      }
      ttvClient.connect().catch((err) => log(err, 'error'))
      votingStartTime = Date.now()
      votingActive = true
      votingType = type
      //reset votes
      switch (type) {
        case 1:
          mapVotes = new Map()
          mapVotesArray = []
          map = null
          break
        case 2:
          gamemodeVotes = new Map()
          gamemodeVotesArray = []
          gamemode = null
          break
      }
      resolve()
    })
  },
  closeVoting: () => {
    return new Promise((resolve, reject) => {
      log('Closing voting', 'chatbot')
      ytClient.stop()
      ttvClient.disconnect()
      votingActive = false
      if (votingType == 1) {
        mapVotesArray = Array.from(mapVotes.values())
      } else {
        gamemodeVotesArray = Array.from(gamemodeVotes.values())
      }
      resolve()
    })
  },
  getVotes: () => {
    return new Promise((resolve, reject) => {
      log('Getting votes', 'chatbot')
      let votesRanking
      if (votingType == 1) {
        if (mapVotesArray.length == 0) return reject()
        votesRanking = [
          ...new Set(
            mapVotesArray
              .sort(
                (a, b) =>
                  mapVotesArray.filter((v) => v === a).length -
                  mapVotesArray.filter((v) => v === b).length
              )
              .reverse()
          ),
        ]
        log(votesRanking, 'chatbot')
        map = votesRanking[0]
        resolve({
          map: votesRanking[0],
          ranking: votesRanking,
        })
      } else {
        if (gamemodeVotesArray.length == 0) return reject()
        votesRanking = [
          ...new Set(
            gamemodeVotesArray
              .sort(
                (a, b) =>
                  gamemodeVotesArray.filter((v) => v === a).length -
                  gamemodeVotesArray.filter((v) => v === b).length
              )
              .reverse()
          ),
        ]
        log(votesRanking, 'chatbot')
        gamemode = votesRanking[0]
        resolve({
          gamemode: votesRanking[0],
          ranking: votesRanking,
        })
      }
    })
  },
  getValidOptions: (map) => {
    return new Promise((resolve, reject) => {
      log(`Getting valid options for ${map}`, 'chatbot')
      resolve(maps[map.toLowerCase()])
    })
  },
}
