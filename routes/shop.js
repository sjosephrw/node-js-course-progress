const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.get('/cart-delete-item/:productId', shopController.getCartDeleteProduct);

router.post('/cart', shopController.postCart);

//router.get('/checkout', shopController.getCheckout);

router.get('/orders', shopController.getOrders);

router.get('/create-orders', shopController.createOrders);

router.get('/order-details/:orderId', shopController.getOrderDetails);

module.exports = router;