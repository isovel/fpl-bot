const express = require('express');

let app;

module.exports = async (client) => {
    app = express();

    const apiDir = client.config.api.directory;
};
