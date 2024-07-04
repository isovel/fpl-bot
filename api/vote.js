const express = require('express');
const router = express.Router();
const {
    startVoting,
    closeVoting,
    getVotes,
    getValidOptions,
} = require('../handlers/chat');

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
            res.status(200).json({ map: 'No votes' });
        });
});

router.get('/api/gamemodeVote/start', (req, res) => {
    startVoting(2)
        .then(() => {
            res.status(200).send('Vote started');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/api/gamemodeVote/close', (req, res) => {
    closeVoting(2)
        .then(() => {
            res.status(200).send('Vote closed');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/api/gamemodeVote/results', (req, res) => {
    getVotes(2)
        .then((votes) => {
            res.status(200).json(votes);
        })
        .catch((err) => {
            res.status(200).json({ gamemode: 'No votes' });
        });
});

router.get('/api/gamemodeVote/getValidOptions', (req, res) => {
    getValidOptions(req.query.map)
        .then((options) => {
            res.status(200).json(options);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

module.exports = router;
