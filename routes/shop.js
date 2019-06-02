const path = require('path');

const express = require('express');

const rootDir = require('../util/path');//refer to the path.js file in util folder, constructs a tidy path to the root project folder.

const router = express.Router();

router.get('/', (req, res, next)=>{
    //res.setHeader('Content-Type', 'text/html');//this is not necessary res.send() from express.js automatically sets the headers, but if you want to overwrite the headers uncomment this line.
    //res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
    res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;