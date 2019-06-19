const Product = require('../models/product');
const Cart = require('../models/cart');



exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products.',
        path: '/products',
        hasProducts: products.length > 0,
        activeProducts: true,
      });
  }).catch( err => {
        console.log(err);
  });
};

exports.getProduct = (req, res, next) => {

  const prodId = req.params.productId;

  Product.findById(prodId)
  .then(product => {
    //console.log(product);
    res.render('shop/product-detail', {
      product: product, 
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => {
      console.log(err);
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      activeShop: true
    });
  }).catch(err => {
      console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(cart => {
      res.render('shop/cart', {
        products: cart,
        pageTitle: 'Your shopping Cart',
        path: '/cart'
      });      
  })
  .catch(err => {console.log(err);});
};



exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
  .catch(err => {console.log(err)});

  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');
};

exports.getCartDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  req.user.deleteItemFromCart(prodId).then(result => {
    res.redirect('/cart');  
  })
  .catch(err => {console.log(err);});
};

exports.createOrders = (req, res, next) => {
  req.user.addOrder()
  .then(result => {
    res.redirect('/orders');      
  })  
  .catch(err => {console.log(err);});
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
    res.render('shop/orders', {
      pageTitle: 'My Orders',
      path: '/orders',
      orders: orders
    })
    .catch(err => {console.log(err);});
  })


};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
      pageTitle: 'Your cart',
      path: '/cart'
    });
};