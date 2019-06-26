const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

//admin/add-product => GET//display all the products for editing
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product/', isAuth, adminController.postEditProduct);

// /admin/delete-product => GET
router.get('/delete-product/:productId', isAuth, adminController.getDeleteProduct);

router.get('/products', isAuth, adminController.getProducts);

module.exports = router;