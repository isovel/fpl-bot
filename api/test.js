const express = require('express');
const router = express.Router();

router.get('/textTest', (req, res) => {
    res.send(`This is a text test<br>This is another line`);
});

router.get('/jsonTest', (req, res) => {
    res.json(`This is a text test\nThis is another line`);
});

router.get('/jsonTest2', (req, res) => {
    res.send(`This is a text test\nThis is another line`);
});

module.exports = router;
