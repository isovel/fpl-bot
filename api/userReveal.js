const express = require('express');
const router = express.Router();

router.get('/userReveal', (req, res) => {
    res.render('./userReveal/index', {
        users: process.client.runtimeVariables.users,
    });
});

module.exports = router;
