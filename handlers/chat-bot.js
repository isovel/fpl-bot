/*import { io } from 'socket.io-client';

const socket = io(
    'backend.chat.restream.io/ws/embed?token=680b51ba-526a-4315-ab7a-efc4eccec7da',
    {
        secure: true,
        extraHeaders: {
            'sec-websocket-extensions':
                'permessage-deflate; client_max_window_bits',
            'sec-websocket-key': 'PkDqCl1rE4l9Zekf5TY/5A==',
            'sec-websocket-version': '13',
        },
    }
);

socket.onAny((event, ...args) => {
    console.log('Got event: ', event, args);
});

socket.on('connect_error', (error) => {
    if (socket.active) {
        // temporary failure, the socket will automatically try to reconnect
        console.log(error);
    } else {
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
        console.log(error.message);
    }
});

socket.on('disconnect', (reason) => {
    if (socket.active) {
        // temporary disconnection, the socket will automatically try to reconnect
    } else {
        // the connection was forcefully closed by the server or the client itself
        // in that case, `socket.connect()` must be manually called in order to reconnect
        console.log(reason);
    }
});

socket.on('connection_info', (data) => {
    console.log(data);
});
*/

import tmi from 'tmi.js'
import { LiveChat } from 'youtube-chat'

// Recommended
const ytClient = new LiveChat({ liveId: 'BJSwhFbOwOg' })
const ttvClient = new tmi.Client({
  channels: ['THiiXY'],
})

// Emit at start of observation chat.
ytClient.on('start', (liveId) => {
  /* Your code here! */
  console.log('start', liveId)
})

// Emit at end of observation chat.
// reason: string?
ytClient.on('end', (reason) => {
  /* Your code here! */
  console.log('end', reason)
})

// Emit at receive chat.
// chat: ChatItem
ytClient.on('chat', (chatItem) => {
  /* Your code here! */
  console.log(`${chatItem.author.name}: ${chatItem.message}`)
})

// Emit when an error occurs
// err: Error or any
ytClient.on('error', (err) => {
  /* Your code here! */
  console.log('error', err)
})

ttvClient.on('message', (channel, tags, message, self) => {
  console.log(`${tags['display-name']}: ${message}`)
})

// Start fetch loop
let ok = ytClient.start()
if (!ok) {
  console.log('Failed to start, check emitted error')
}

ttvClient.connect().catch(console.error)
