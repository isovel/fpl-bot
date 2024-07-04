const { LiveChat } = require('youtube-chat');
const tmi = require('tmi.js');
const { log } = require('../functions');

let votingStartTime;
let votingActive = false;
let votingType; // 1=map, 2=gamemode
let map;
let gamemode;

// Recommended
const ytClient = new LiveChat({ liveId: 'BJSwhFbOwOg' });
const ttvClient = new tmi.Client({
    channels: ['THiiXY'],
});

/*
Bank It: All maps
Cashout: All maps
Quick Cash: All maps
Terminal Attack: All maps but no Seoul
Power Shift: No Las Vegas 
So it's just Seoul on TA. no vegas on Powershift and solo bank it we wasn't adding anyways 
*/

const maps = {
    'monaco': [
        'bank it',
        'cashout',
        'quickcash',
        'terminal attack',
        'power shift',
    ],
    'seoul': ['bank it', 'cashout', 'quickcash', 'power shift'],
    'skyway': [
        'bank it',
        'cashout',
        'quickcash',
        'power shift',
        'terminal attack',
    ],
    'vegas': ['cashout', 'quickcash', 'bank it', 'terminal attack'],
    'horizon': [
        'cashout',
        'quickcash',
        'bank it',
        'terminal attack',
        'power shift',
    ],
    'kyoto': [
        'cashout',
        'quickcash',
        'bank it',
        'terminal attack',
        'power shift',
    ],
};

let mapVotes = new Map();
let mapVotesArray;

let gamemodeVotes = new Map();
let gamemodeVotesArray;

function newMessage(message, author, createdAt) {
    if (!message.startsWith('!')) return;
    if (votingActive && !message.startsWith('!v')) return;
    message = message.split(' ').slice(1).join(' ');
    if (votingActive) {
        if (createdAt < votingStartTime) return;
        if (votingType == 1) {
            if (Object.keys(maps).includes(message.toLowerCase())) {
                if (mapVotes.has(author)) return;
                mapVotes.set(author, message);
                log(`${author} voted for ${message}`, 'chatbot');
            }
        } else {
            if (maps[map].includes(message.toLowerCase())) {
                if (gamemodeVotes.has(author)) return;
                gamemodeVotes.set(author, message);
                log(`${author} voted for ${message}`, 'chatbot');
            }
        }
    }
}

ytClient.on('start', (liveId) => {
    log(`Started observing chat for ${liveId}`, 'chatbot');
});

ytClient.on('end', (reason) => {
    log(reason, 'warning');
});

ytClient.on('chat', (chatItem) => {
    newMessage(
        chatItem.message[0].text,
        chatItem.author.name,
        new Date(chatItem.timestamp)
    );
});

ytClient.on('error', (err) => {
    console.error(err);
});

ttvClient.on('message', (channel, tags, message, self) => {
    newMessage(message, tags['display-name'], Date.now());
});

// Start fetch loop
let ok = ytClient.start();
if (!ok) {
    log('Failed to start ytClient, check emitted error', 'error');
}

ttvClient.connect().catch((err) => log(err, 'error'));

module.exports = {
    startVoting: (type) => {
        return new Promise((resolve, reject) => {
            log(
                `Starting voting for ${type == 1 ? 'map' : 'gamemode'}`,
                'chatbot'
            );
            votingStartTime = Date.now();
            votingActive = true;
            votingType = type;
            resolve();
        });
    },
    closeVoting: () => {
        return new Promise((resolve, reject) => {
            log('Closing voting', 'chatbot');
            votingActive = false;
            if (votingType == 1) {
                mapVotesArray = Array.from(mapVotes.values());
            } else {
                gamemodeVotesArray = Array.from(gamemodeVotes.values());
            }
            resolve();
        });
    },
    getVotes: () => {
        return new Promise((resolve, reject) => {
            log('Getting votes', 'chatbot');
            let votesRanking;
            if (votingType == 1) {
                votesRanking = [
                    ...new Set(
                        mapVotesArray
                            .sort(
                                (a, b) =>
                                    mapVotesArray.filter((v) => v === a)
                                        .length -
                                    mapVotesArray.filter((v) => v === b).length
                            )
                            .reverse()
                    ),
                ];
                log(votesRanking, 'chatbot');
                resolve({
                    map: votesRanking[0],
                    ranking: votesRanking,
                });
            } else {
                votesRanking = [
                    ...new Set(
                        gamemodeVotesArray
                            .sort(
                                (a, b) =>
                                    gamemodeVotesArray.filter((v) => v === a)
                                        .length -
                                    gamemodeVotesArray.filter((v) => v === b)
                                        .length
                            )
                            .reverse()
                    ),
                ];
                log(votesRanking, 'chatbot');
                resolve({
                    gamemode: votesRanking[0],
                    ranking: votesRanking,
                });
            }
        });
    },
};
