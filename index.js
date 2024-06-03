console.log('Loading DotEnv...');
require('dotenv').config();
console.log('Loading ExtendedClient...');
const ExtendedClient = require('./class/ExtendedClient');
console.log('Loaded ExtendedClient');

const client = new ExtendedClient();

client.start();

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
