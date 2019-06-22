const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

//admin/add-product => GET//display all the products for editing
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product/', adminController.postEditProduct);

// /admin/delete-product => GET
router.get('/delete-product/:productId', adminController.getDeleteProduct);

router.get('/products', adminController.getProducts);

module.exports = router;