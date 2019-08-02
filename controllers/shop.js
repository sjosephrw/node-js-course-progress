const appConstants = require("../important/constants");

const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

const PDFDocument = require('pdfkit');

//importing helpers
const shopHelper = require('../helpers/shop');


// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(appConstants.stripeSecretKey);


//const path = '/public/img';

const ITEMS_PER_PAGE = 3;

  let checkFileExists = path => new Promise((resolve, reject) => {

    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        console.error(err)
        resolve('https://dummyimage.com/600x400/000/fff');
      }
    
      //file exists
      resolve('http://localhost:3000/'+path);
    })  

  });

  const doesFileExist = (fileName) => {
    // fs.access(fileName, fs.F_OK, (err) => {
    //   if (err) {
    //     console.log(err);
    //     //return 'https://dummyimage.com/600x400/000/fff';
    //     return false;
 
    //   }
  
    //   //file exists
    //   //return 'http://localhost:3000/'+fileName;
    //   return true;
    // });
    //https://flaviocopes.com/how-to-check-if-file-exists-node/
    if (fs.existsSync(fileName)){
      return 'http://localhost:3000/'+fileName;
    } else {
      return 'https://dummyimage.com/600x400/000/fff';
    }
  };

async function stripeCharge(req, totalInCents){

// // Set your secret key: remember to change this to your live secret key in production
// // See your keys here: https://dashboard.stripe.com/account/apikeys
// const stripe = require('stripe')('sk_test_DyZyKkniP9tysTNdiE0GVySM00HgcL9UKf');

// // Token is created using Checkout or Elements!
// // Get the payment token ID submitted by the form:
// const token = request.body.stripeToken; // Using Express

// (async () => {
//   const charge = await stripe.charges.create({
//     amount: 999,
//     currency: 'usd',
//     description: 'Example charge',
//     source: token,
//   });
// })();

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express

  const charge = await stripe.charges.create({
    amount: totalInCents,
    currency: 'usd',
    description: 'Purchasing products from my test website.',
    source: token,
  });
   //https://stripe.com/docs/api/charges/object
  if (charge.status === 'succeeded'){
    console.log(`Success: ${charge}`);
    return true;
  } else {
    console.log(`Error: ${charge}`);
    return false;
  } 
}

exports.getProducts = (req, res, next) => {
  // || 1 means if page is undefined or holds a invalid value force page to be 1
  const page = +req.query.page || 1;//the + sign is to convert page to a number, because it is a string
  let totalItems;
  //console.log(page);

  Product.countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE); 
  })
  .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products.',
        path: '/products',
        totlaProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasProducts: products.length > 0,
        activeProducts: true,
        doesFileExist: doesFileExist
        // prods: products.map(element => {
        ////https://stackoverflow.com/questions/48666927/javascript-loop-through-array-of-objects-and-take-two-values-and-insert-into-new
        //     return {
        //       _id: element._id,
        //       title: element.title,
        //       description: element.description,
        //       price: element.price, 
        //       doesFileExist: doesFileExist(element.imageUrl)           
        //   };
        // })
      });
      //console.log(products);
  
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
    //console.log('getProduct controller  '+JSON.stringify(req.session.cart) + ' '+ JSON.stringify(req.session.cartTotal));

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
      activeShop: true,
      csrfToken: req.csrfToken()  
    });
  }).catch(err => {
      console.log(err);
  });
};

// exports.getCart = (req, res, next) => {
  
//   //https://dev.to/jcolborndropdeadgames/user-authentication-with-expressjs-44od

//   if (req.user){//if logged in

//     req.user
//     .populate('cart.items.productId')
//     .execPopulate()
//     .then(user => {
        
//         const products = user.cart.items;
//         console.log(products);
  
//         res.render('shop/cart', {
//           products: products,
//           pageTitle: 'Your shopping Cart',
//           path: '/cart' 
//         });      
//     })
//     .catch(err => {console.log(err);});

//   } else {//if not logged in display sesssion cart

//     if (req.session.cart){

//       const products = req.session.cart;

//       const a = products.map(element => {
//         return element._id;
//       });

//       const quantitiesInCart = products.map(element => {
//         return element.qty;
//       });      

//         let promises = [];

//         a.forEach(el => {
//           promises.push(shopHelper.getProductTitle(el));
//         })

//         Promise.all(promises)
//         .then((products) => {

//             const newArray = [];

//             for (let x = 0;x < products.length; x++){

//               let tempObj = {
//                 '_id': '',
//                 'title': '',
//                 'price': '',
//                 'imageUrl': '',
//                 'qty': ''                
//              };

//               tempObj._id = products[x]._id;
//               tempObj.title = products[x].title;
//               tempObj.price = products[x].price;
//               tempObj.imageUrl = `http://localhost:3000/${products[x].imageUrl}`;
//               tempObj.qty = quantitiesInCart[x];
//               newArray.push(tempObj);
//             }
            
//             // console.log(newArray);

//             res.render('shop/cart', {
//               products: newArray,
//               pageTitle: 'Your shopping Cart',
//               path: '/cart',
//               doesFileExist: doesFileExist
//             });

//         }).catch(err => console.log(err));
        
//     } else {// if we dont res.render() the view below when the session cart is empty nothing is displayed 
//       res.render('shop/cart', {
//         products: [],
//         pageTitle: 'Your shopping Cart',
//         path: '/cart'
//       });
//     }
//   }
// };


exports.getCart = (req, res, next) => {
  
  //https://dev.to/jcolborndropdeadgames/user-authentication-with-expressjs-44od

  if (req.user){//if logged in

    //https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do
    //https://riptutorial.com/mongoose/example/22494/a-simple-mongoose-populate-example
    
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        
        const products = user.cart.items;
        //console.log(products);
  
        res.render('shop/cart', {
          products: products,
          pageTitle: 'Your shopping Cart',
          path: '/cart' 
        });      
    })
    .catch(err => {console.log(err);});

  } else {//if not logged in display sesssion cart

    if (req.session.cart){

      const products = req.session.cart;

      const a = products.map(element => {
        return element._id;
      });

      const quantitiesInCart = products.map(element => {
        return element.qty;
      });      

        let promises = [];

        a.forEach(el => {
          promises.push(shopHelper.getProductTitle(el));//gets not only the title but all product details.
        })

        Promise.all(promises)//get the product details using this promise
        .then((products) => {
          //console.log(products);
          const a = products.map(element => {
            return element.imageUrl;
          });
            console.log(a);
            let promises = [];
    
            a.forEach(el => {
              promises.push(checkFileExists(el));
            })
    
            Promise.all(promises)//then check whether the images related to each product exists using this promise
            .then((imgs) => {
                const newArray = [];
    
                for (let x = 0;x < products.length; x++){
    
                  let tempObj = {
                    '_id': '',
                    'title': '',
                    'price': '',
                    'imageUrl': ''                
                 };
    
                  tempObj._id = products[x]._id;
                  tempObj.title = products[x].title;
                  tempObj.price = products[x].price;
                  tempObj.imageUrl = imgs[x];
                  tempObj.qty = quantitiesInCart[x];
                  newArray.push(tempObj);
                }
            console.log(newArray);

            res.render('shop/cart', {
              products: newArray,
              pageTitle: 'Your shopping Cart',
              path: '/cart'
            });    

        }).catch(err => console.log(`Img promise error ${err}`));
        


        }).catch(err => console.log(err));
        
    } else {// if we dont res.render() the view below when the session cart is empty nothing is displayed 
      res.render('shop/cart', {
        products: [],
        pageTitle: 'Your shopping Cart',
        path: '/cart'
      });
    }
  }

  console.log(req.session);

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  if (req.user){
    Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      //console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {console.log(err);});
  
  } else {
    //if there are items in the cart require it or create a cart instance with a empty obj.
    const cart = new Cart(req.session.cart ? req.session.cart : []
      , req.session.cartTotal ? req.session.cartTotal : 0);
    
    Product.findById(prodId)
    .then(product => {
      cart.addProduct(product);
      req.session.cart = cart.items;
      req.session.cartTotal = cart.totalPrice;
      req.session.save(err => {//we are returning to prevent the code below the err=> callback from being executed.
        console.log(err);
        //res.redirect('/');
      });
      //console.log(req.session);
      res.redirect('/cart');      
    })
    .catch(err => {console.log(err);});  
  }



  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');
};

exports.getCartDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  if(req.user){

    req.user.removeFromCart(prodId).then(result => {
      res.redirect('/cart');  
    })
    .catch(err => {console.log(err);});
  
  } else {//deleting guest users product from the cart
    //if there are items in the cart require it or create a cart instance with a empty obj.
    const cart = new Cart(req.session.cart ? req.session.cart : []
      , req.session.cartTotal ? req.session.cartTotal : 0);
    
    Product.findById(prodId)
    .then(product => {
      cart.deleteProduct(product, product.price);
      req.session.cart = cart.items;
      req.session.cartTotal = cart.totalPrice;
      req.session.save();
      //console.log(req.session);
      res.redirect('/cart');      
    })
    .catch(err => {console.log(err);}); 
  }

};

exports.getCheckout = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
   
      const products = user.cart.items;
      let total = 0;    
      products.forEach(p => {
        total = total + p.productId.price * p.quantity;
      });

      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        orderTotal: total
      });      
  })
  .catch(err => {console.log(err);});
 
};

// exports.createOrders = (req, res, next) => {

//   req.user
//   .populate('cart.items.productId')
//   .execPopulate()
//   .then(user => {
//       const products = user.cart.items.map(i => {
//         return {quantity: i.quantity, product: {...i.productId._doc}};//we want all the product data, all the product data is a documnet so ._doc
//       });

//       const order = new Order({
//         user: {
//           email: req.user.email,
//           userId: req.user
//         },
//         products: products
//       }); 
//      return order.save();     
//   }).then(result => {
//     return req.user.clearCart();
//   }).then(result => {
//     res.redirect('/orders');
//   }).catch(err => {
//     console.log(err);
//   });
// };


exports.createOrders = (req, res, next) => {

  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    const products = user.cart.items;
    let total = 0;    
    products.forEach(p => {
      total += p.productId.price * p.quantity;
    });

    let totalInCents = total * 100;

    console.log(totalInCents);
    console.log(req.body.stripeToken);
    //https://medium.com/platformer-blog/node-js-concurrency-with-async-await-and-promises-b4c4ae8f4510
    const result = stripeCharge(req, totalInCents);//asynchronous function
    
    if (result){
      return user;
    } else {
      console.log(result);
    }

  })
  .then(user => {
    const products = user.cart.items.map(i => {
      return {quantity: i.quantity, product: {...i.productId._doc}};//we want all the product data, all the product data is a documnet so ._doc
    });

    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    }); 
   return order.save();
  })
  .then(result => {
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
  const ordId = req.params.orderId;
  Order.find({'_id': ordId})
    .then(orders => {
      console.log(orders[0].user);
      console.log(orders[0].products);      
      //return;
      res.render('shop/order-details', {
        pageTitle: 'Your Order details',
        path: '/order-details',
        orders: orders[0].products,
        orderId: ordId
      });
    })
    .catch(err => {console.log(err)});
};

exports.getOrderInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = orderId+'.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);



  Order.findById(orderId)
    .then(order => {
      if (!order){
        next(new Error('Invalid order ID'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()){
        next(new Error('Unauthorized!'));
      }

      const pdfDoc = new PDFDocument();//this is also a readable stream

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' +invoiceName+ '"');//pdf appears in the browser
      
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('INVOICE', {
        underline: true
      });
    
      pdfDoc.text('----------------------------------------');
    
      let totalPrice = 0;
    
      order.products.forEach(prod => {
        pdfDoc.fontSize(14).text(
          prod.product.title + '-' + prod.quantity + 'x $' + prod.product.price 
        );
        totalPrice = totalPrice + prod.quantity * prod.product.price;
      });
    
      pdfDoc.text('----------------------------------------');
      
      pdfDoc.text(`Total Price: ${totalPrice}`);
    
      pdfDoc.end();

      //*************IMPORTANT  */this is called preloading data and uses a lot of memory, so its better to use streaming data
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err){
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', 'inline; filename="' +invoiceName+ '"');//pdf appears in the browser
      //   //res.setHeader('Content-Disposition', 'attachment; filename="' +invoiceName+ '"');//************ IMPORTANT */the file save dialog box appears
      //   res.send(data);
      // });

      //this is called streaming data and it does not use a lot of memory
      const file = fs.createReadStream(invoicePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' +invoiceName+ '"');//pdf appears in the browser
      res.pipe(file);
    })
    .catch(err => {next(err);});
};