const fs = require('fs');

const fileHelper = require('../util/file');

const Product = require('../models/product');

const { validationResult } = require('express-validator');

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

// async function myFunction(url){
//   const feed = await checkFileExists(url);
//   // do whatever you need with feed below
//   return feed;
// }

    // if (err) reject('https://dummyimage.com/600x400/000/fff');
    // //file exists
    // resolve('http://localhost:3000/'+imageUrl);

exports.getAddProduct = (req, res, next) => {

  //https://jira.mongodb.org/browse/NODE-1401
  Product.find().then(
    res.render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product/',
      errorMessage: Array(),
      successMessage: Array()                 
    }))
    .catch(err => {
      console.log(err);
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  //console.log(`The controller ${req.user._id}`);
  const imageUrl = req.file;
  console.log(imageUrl);
  //return;
  const price = req.body.price;
  const description = req.body.description;

  if (!imageUrl){
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product/',
      errorMessage: Array('Invalid image specified'),
      successMessage: Array(),      
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      }  
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()){
    console.log(errors);
    return res.render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product/',
      errorMessage: errors.array(),
      successMessage: Array(),      
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      }  
    });    
  }

  image = imageUrl.path;

  const product = new Product({
     title: title,
     imageUrl: image,
     price: price,
     description: description,
     userId: req.user //-though the entire user obj is passed mongoose selects only the user ID
  });//in the request the user._id is a string
  product.save().then(result => {//mongoose has a built in save() method
    //throw new Error('test error');//you can force a error like this
    console.log('Created Products.');
    res.redirect('/admin/products');
  }).catch(err => {
    console.log('An error occured');
    console.log(err);
    //res.redirect('/500');
  
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);//skip all other middle wares and proceed straight to the error handling middle ware.
  
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
      hasError: false,
      product: product,
      errorMessage: Array(),
      successMessage: Array(),         
    });
  })
  .catch(err => {console.log(err)});

};


exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const updatedTitle = req.body.title; 
  const image = req.file; 
  const updatedPrice = req.body.price; 
  const updatedDescription = req.body.description;   

  const errors = validationResult(req);

  if (!errors.isEmpty()){
    console.log(errors);
    return res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product/',
      errorMessage: errors.array(),
      successMessage: Array(),      
      editing: true,
      hasError: true,
      product: {
        _id: id,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription
      }  
    });    
  }  

  Product.findById(id).then(product => {
    if (product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    if (image){
      product.imageUrl = image.path;
      fileHelper.deleteFile(product.imageUrl);//remove the existing image and replace it with the new image
    }

    product.price = updatedPrice;
    product.description = updatedDescription;
    return product.save().then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    });
  })  
  .catch(err => {
    //console.log(err);
    //res.redirect('/500');
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);//skip all other middle wares and proceed straight to the error handling middle ware.  
  });

};
//this was changed to a ajax request
exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if(!product) return next(new Error('Product not found.'));
      fileHelper.deleteFile(product.imageUrl);//remove the existing image and replace it with the new image  
      return Product.deleteOne({_id: prodId, userId: req.user._id})
    })
  .then(() => {
    console.log('PRODUCT DELETED.');
    //res.redirect('/admin/products'); 
    res.status(200).json({message: "Success!"});
  })
  .catch(err => {
    //console.log(err)
    res.status(500).json({message: "Failed!"});
  });
   
};

// exports.getProducts = (req, res, next) => {

//     // || 1 means if page is undefined or holds a invalid value force page to be 1
//     const page = +req.query.page || 1;//the + sign is to convert page to a number, because it is a string
//     let totalItems;

//     Product.find({userId: req.user._id}).then((products) => {

//       const a = products.map(element => {
//         return element.imageUrl;
//       });
//         console.log(a);
//         let promises = [];

//         a.forEach(el => {
//           promises.push(checkFileExists(el));
//         })

//         Promise.all(promises)
//         .then((imgs) => {
//             const newArray = [];


//             for (let x = 0;x < products.length; x++){
//               console.log(products[x]._id + ' 239');
//               console.log(products[x].title + ' 239');

//               let tempObj = {
//                 '_id': '',
//                 'title': '',
//                 'description': '',
//                 'price': '',
//                 'imageUrl': ''                
//              };

//               tempObj._id = products[x]._id;
//               tempObj.title = products[x].title;
//               tempObj.description = products[x].description;
//               tempObj.price = products[x].price;
//               tempObj.imageUrl = imgs[x];
//               newArray.push(tempObj);
//             }

//             console.log(newArray)

//             console.log('all resolved ', imgs);
//             //products.imageUrl = imgs;
//             res.render('admin/products', {
//               prods: newArray,
//               pageTitle: 'Admin Products',
//               path: '/admin/products',
//               activeShop: true  
//             });            
//         })

//   }).catch(err => {
//       console.log(err);
//   });
// };

exports.getProducts = (req, res, next) => {

    // || 1 means if page is undefined or holds a invalid value force page to be 1
    const page = +req.query.page || 1;//the + sign is to convert page to a number, because it is a string
    let totalItems;


    Product.countDocuments().then(numProducts => {
      totalItems = numProducts;
      return Product.find({userId: req.user._id}).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE); 
    }).then((products) => {

      const a = products.map(element => {
        return element.imageUrl;
      });
        console.log(a);
        let promises = [];

        a.forEach(el => {
          promises.push(checkFileExists(el));
        })

        Promise.all(promises)
        .then((imgs) => {
            const newArray = [];


            for (let x = 0;x < products.length; x++){
              console.log(products[x]._id + ' 239');
              console.log(products[x].title + ' 239');

              let tempObj = {
                '_id': '',
                'title': '',
                'description': '',
                'price': '',
                'imageUrl': ''                
             };

              tempObj._id = products[x]._id;
              tempObj.title = products[x].title;
              tempObj.description = products[x].description;
              tempObj.price = products[x].price;
              tempObj.imageUrl = imgs[x];
              newArray.push(tempObj);
            }

            console.log(newArray)
            console.log('all resolved ', imgs);
            
            res.render('admin/products', {
              prods: newArray,
              pageTitle: 'Admin Products',
              path: '/admin/products',
              totlaProducts: totalItems,
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
              hasProducts: products.length > 0,              
              activeShop: true  
            });            
        })

  }).catch(err => {
      console.log(err);
  });
};