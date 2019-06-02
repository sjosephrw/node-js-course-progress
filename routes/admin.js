//core node modules 
const path = require('path');

//3rd party node modules
const express = require('express');

const router = express.Router();

//it's best to write the url like /admin/add-product or /admin/product
//but there is a better way in app.js write it like this app.use('/admin', adminRoutes);//importing the adminRoutes object.

//add-product => GET
router.get('/add-product', (req, res, next)=>{
    res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
});

//add-product => POST
router.post('/add-product', (req, res, next)=>{
    console.log(req.body);
    res.redirect('/');//redirects to app.use('/', (req, res, next)=>{
});

module.exports = router;