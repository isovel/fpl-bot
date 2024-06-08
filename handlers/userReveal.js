const { log } = require('../functions');
const express = require('express');
const fs = require('fs');
const ip = require('ip');
let app;

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = {
    startWebServer: (users) => {
        return new Promise((resolve, reject) => {
            //Start a web server with the users
            log(users, 'debug');
            app = express();

            //app static
            app.use(express.static('./static/userReveal/'));

            //serve
            app.listen(4804, () => {
                let url = `http://${ip.address()}:4804`;
                log('Server started on ' + url, 'info');
                resolve(url);
            });
        });
    },
};
