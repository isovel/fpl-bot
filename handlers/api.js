const express = require('express');
const ip = require('ip');
const fs = require('fs');
const { log } = require('../functions');
const path = require('path');

let app;

module.exports = async (client) => {
    app = express();

    const apiDir = client.__dirname + '/api/';
    const apiFiles = fs.readdirSync(apiDir).filter((f) => f.endsWith('.js'));

    app.set('views', path.join(client.__dirname, '/static'));
    app.set('view engine', 'ejs');
    app.use(express.static('./static'));

    for (const file of apiFiles) {
        const module = require(apiDir + file);

        if (!module) continue;

        app.use('/', module);
    }

    appServer = app.listen(4804, () => {
        let url = `http://${ip.address()}:4804/`;
        log('Server started on ' + url, 'info');
    });
};
