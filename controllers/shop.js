const Product = require('../models/product');
const Cart = require('../models/cart');//not used anymore
const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
  Product.find()
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
  Product.find().then(products => {
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
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
      
      const products = user.cart.items;
      console.log(products);

      res.render('shop/cart', {
        products: products,
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
  req.user.removeFromCart(prodId).then(result => {
    res.redirect('/cart');  
  })
  .catch(err => {console.log(err);});
};

exports.createOrders = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, product: {...i.productId._doc}};//we want all the product data, all the product data is a documnet so ._doc
      });

      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      }); 
      order.save();     
  }).then(result => {
    return req.user.clearCart();
  }).then(result => {
    res.redirect('/orders');
  }).catch(err => {
    console.log(err);
  });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    
    console.log(orders);

    res.render('shop/orders', {
      pageTitle: 'My Orders',
      path: '/orders',
      orders: orders
    })
  })
  .catch(err => {console.log(err);});


};

exports.getOrderDetails = (req, res, next) => {
  const ordId = req.body.orderId;
  Order.find(ordId)
    .then(orders => {
      console.log(orders[0].user);
      console.log(orders[0].products);      
      //return;
      res.render('shop/order-details', {
        pageTitle: 'Your Order details',
        path: '/order-details',
        orders: orders[0].products
      });
    })
    .catch(err => {console.log(err)});
};

