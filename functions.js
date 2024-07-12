const chalk = require('chalk');
const config = process.env.PRODUCTION
    ? require('./server-config')
    : require('./config');
const fs = require('fs');

let client;

let logFile = config.development.logFile;

/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | 'debug' | 'interaction' | 'chatbot' | undefined} style - The style of the log.
 */
const log = (string, style, dirLog) => {
    const styles = {
        info: {
            prefix: chalk.blue('[INFO]'),
            txtPrefix: '[INFO]',
            logFunction: console.log,
        },
        err: {
            prefix: chalk.red('[ERROR]'),
            txtPrefix: '[ERROR]',
            logFunction: console.error,
        },
        warn: {
            prefix: chalk.yellow('[WARNING]'),
            txtPrefix: '[WARNING]',
            logFunction: console.warn,
        },
        done: {
            prefix: chalk.green('[SUCCESS]'),
            txtPrefix: '[SUCCESS]',
            logFunction: console.log,
        },
        debug: {
            prefix: chalk.magenta('[DEBUG]'),
            txtPrefix: '[DEBUG]',
            logFunction: console.log,
        },
        interaction: {
            prefix: chalk.cyan('[INTERACTION]'),
            txtPrefix: '[INTERACTION]',
            logFunction: console.log,
        },
        chatbot: {
            prefix: chalk.cyan('[CHATBOT]'),
            txtPrefix: '[CHATBOT]',
            logFunction: console.log,
        },
    };

    const selectedStyle = styles[style] || { logFunction: console.log };
    if (!dirLog) {
        if (style != 'err') {
            switch (typeof string) {
                case 'object':
                    string =
                        string.constructor.name +
                        ': ' +
                        JSON.stringify(string, null, 2);
                    break;
                case 'number':
                    string = string.constructor.name + ': ' + string;
                    break;
                case 'boolean':
                    string = string.constructor.name + ': ' + string;
                    break;
                case 'undefined':
                    string = 'Empty log message.';
                    break;
            }
            selectedStyle.logFunction(
                `${selectedStyle.prefix || ''} ${string}`
            );
        } else {
            selectedStyle.logFunction(
                `${selectedStyle.prefix || ''} ${string}`
            );
        }
    } else {
        console.dir(string);
    }

    fs.appendFile(
        logFile,
        `${selectedStyle.txtPrefix || ''} ${string}\n`,
        (err) => {
            if (err) {
                console.error(`${chalk.red('[ERROR]')} ${err}`);
            }
        }
    );

    if (style === 'err') {
        //write dm to config.users.ownerId
        switch (config.handler.errors) {
            case 'owner':
                client.users.send(config.users.ownerId, `Error: ${string}`);
                break;
            case 'developers':
                config.users.developers.forEach((developer) => {
                    client.users.send(developer, `Error: ${string}`);
                });
                break;
            default:
                client.users.send(config.users.ownerId, `Error: ${string}`);
                break;
        }
    }
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => {
    return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ''}>`;
};

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id 
 * @returns {boolean}
 */
const isSnowflake = (id) => {
    return /^\d+$/.test(id);
};

module.exports = {
    log,
    time,
    isSnowflake,
    setupFunctions: (clientInstance) => {
        client = clientInstance;
    },
};
