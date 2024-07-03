const express = require('express');
const router = express.Router();

router.get('/textTest', (req, res) => {
    res.send(`This is a text test<br>This is another line`);
});

module.exports = router;
