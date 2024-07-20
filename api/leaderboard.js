const express = require('express');
const router = express.Router();
const { getClient } = require('../handlers/mongodb');
const { getLeaderboard } = require('../handlers/leaderboard');

router.get('/api/leaderboard', (req, res) => {
    //check if query param division
    if (!req.query.division) {
        return res.status(400).send('Division query param is required');
    }

    db = getClient();

    //get leaderboard data
    getLeaderboard(db, req.query.division)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

module.exports = router;
