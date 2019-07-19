const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.get('/cart-delete-item/:productId', shopController.getCartDeleteProduct);

router.post('/cart', shopController.postCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-orders', isAuth, shopController.createOrders);

router.get('/order-details/:orderId', isAuth, shopController.getOrderDetails);

router.get('/order-details/:orderId', isAuth, shopController.getOrderDetails);

router.get('/order-invoice/:orderId', isAuth, shopController.getOrderInvoice);

module.exports = router;