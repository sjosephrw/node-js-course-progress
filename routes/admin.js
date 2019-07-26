const path = require('path');

const express = require('express');

const { check, body } = require('express-validator');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

//Router level middleware router.use
const router = express.Router();

router.get('/products', isAuth, adminController.getProducts);

//admin/add-product => GET//display all the products for editing
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', [
    body('title')
    .isString()//dont put .isAlphanumeric() then if there is a white space validation will fail
    .isLength({min: 3})
    .trim(),  
    body('price')
    .isFloat(),
    body('description')
    .isLength({min: 5, max: 400})
    .trim()    
], isAuth, adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product/', [
    body('title')
    .isString()//dont put .isAlphanumeric() then if there is a white space validation will fail
    .isLength({min: 3})
    .trim(),   
    body('price')
    .isFloat(),
    body('description')
    .isLength({min: 5, max: 400})
    .trim()    
], isAuth, adminController.postEditProduct);

// /admin/delete-product => GET
//router.get('/delete-product/:productId', isAuth, adminController.getDeleteProduct);
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;