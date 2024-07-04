const express = require('express');
const router = express.Router();
const { startVoting, closeVoting, getVotes } = require('../handlers/chat');

router.get('/api/mapVote/start', (req, res) => {
    startVoting(1)
        .then(() => {
            res.status(200).send('Vote started');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/api/mapVote/close', (req, res) => {
    closeVoting(1)
        .then(() => {
            res.status(200).send('Vote closed');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/api/mapVote/results', (req, res) => {
    getVotes(1)
        .then((votes) => {
            res.status(200).json(votes);
        })
        .catch((err) => {
            res.status;
        });
});

module.exports = router;
