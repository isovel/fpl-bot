const { log } = require('../functions');
const express = require('express');
const fs = require('fs');
const ip = require('ip');
let app, appServer;

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
            app.set('view engine', 'ejs');

            let randomString = Math.random().toString(36).substring(7);
            //set views folder to static
            app.set('views', './static');

            //set static folder
            app.use(express.static('./static/userReveal'));

            app.get(`/${randomString}/`, (req, res) => {
                log('Serving website to user', 'info');
                res.render('./userReveal/index', { users });
            });

            //serve
            appServer = app.listen(4804, () => {
                let url = `http://${ip.address()}:4804/${randomString}/`;
                resolve(url);
                log('Server started on ' + url, 'info');
            });
        });
    },
    stopWebServer: () => {
        if (app) {
            log('Stopping web server...', 'info');
            appServer.close(() => {
                app = null;
                return true;
            });
        } else {
            return false;
        }
    },
    isWebServerRunning: () => {
        return app != null;
    },
};
