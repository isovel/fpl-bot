const { MongoClient } = require('mongodb');
const config = require('../config');
const { log } = require('../functions');

module.exports = async () => {
    log('Started connecting to MongoDB...', 'warn');

    const client = new MongoClient(
        process.env.MONGODB_URI || config.handler.mongodb.uri
    );

    log('MongoDB is connected to the atlas!', 'done');

    return client;
};
