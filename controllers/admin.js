const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {

  //https://jira.mongodb.org/browse/NODE-1401
  Product.find().then(
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product/',
      editing: false      
    }))
    .catch(err => {
      console.log(err);
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  //console.log(`The controller ${req.user._id}`);
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
     title: title,
     imageUrl: imageUrl,
     price: price,
     description: description,
     userId: req.user //-though the entire user obj is passed mongoose selects only the user ID
  });//in the request the user._id is a string
  product.save().then(result => {//mongoose has a built in save() method
    console.log('Created Products.');
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });

};


exports.getEditProduct = (req, res, next) => {

  const editMode = req.query.edit;

  if (!editMode){
    return res.redirect('/');
  }

  const prodId = req.params.productId;

  Product.findById(prodId)
  .then(product => {

    if (!product){
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product/',
      editing: editMode,
      product: product  
    });
  })
  .catch(err => {console.log(err)});

};


exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const updatedTitle = req.body.title; 
  const updatedImageUrl = req.body.imageUrl; 
  const updatedPrice = req.body.price; 
  const updatedDescription = req.body.description;   
   
  Product.findById(id).then(product => {
    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;
    return product.save();
  })  
  .then(result => {
    console.log('UPDATED PRODUCT!');
    res.redirect('/admin/products');
  })
  .catch(err => {console.log(err)});

};

exports.getDeleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByIdAndRemove(prodId)
  .then(() => {
    console.log('PRODUCT DELETED.');
    res.redirect('/admin/products'); 
  })
  .catch(err => {console.log(err)});
   
};

exports.getProducts = (req, res, next) => {
    Product.find().then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        activeShop: true
      });
  }).catch(err => {
      console.log(err);
  });
};