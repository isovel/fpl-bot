const { MongoClient } = require('mongodb');
const config = process.env.PRODUCTION
    ? require('../server-config')
    : require('../config');
const { log } = require('../functions');

module.exports = async () => {
    log('Started connecting to MongoDB...', 'info');

    const client = new MongoClient(
        process.env.MONGODB_URI || config.handler.mongodb.uri
    );

    log('MongoDB is connected to the atlas!', 'done');

    return client;
};
