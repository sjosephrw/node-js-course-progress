// const fs = require('fs');
// const path = require('path');

//var ObjectId = require('mongodb').ObjectID;

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'cart.json'
// );

module.exports = class Cart{
//NodeJS / Express / MongoDB - Build a Shopping Cart - #12 Cart Model  
//https://www.youtube.com/watch?v=_pVKGCzbMwg
  
  constructor(oldCart, oldCartTotalPrice){
    //console.log(`Old Cart ${oldCart}`);
    this.items = oldCart ? oldCart : [];
    this.totalPrice = oldCartTotalPrice || 0;
  }

  //https://stackoverflow.com/questions/29298777/find-right-object-with-specific-id
  doesProductExistInCart(cart, newlyAddedProduct){
    var index = cart.map((element) => {
      console.log('el '+JSON.stringify(element));
      return element._id.toString();
    }).indexOf(newlyAddedProduct._id.toString());
    return index;
  }

  addProduct(product) {

    // console.log(`Newly added  ${product}`);
    // console.log(`this.items ${JSON.stringify(this.items)}`);

     //Analyze the cart => Find existing product
    //BELOW ALSO WORKS
    // const existingProductIndex = this.items.map((element) => {
    //   // console.log('el '+JSON.stringify(element));
    //   return element._id.toString();
    // }).indexOf(product._id.toString());
    //ABOVE ALSO WORKS

    const existingProductIndex = this.doesProductExistInCart(this.items, product);//CHECKS IF THE NEWLY ENTERED ITEM EXISTS IN THE CART
  
    // console.log(`Existing product ${existingProductIndex}`);

    const existingProduct = this.items[existingProductIndex];
    let updatedProduct;
    // Add new product/ increase quantity
    if (existingProduct) {
      updatedProduct = { ...existingProduct };
      updatedProduct.qty = updatedProduct.qty + 1;
      this.items = [...this.items];
      this.items[existingProductIndex] = updatedProduct;
    } else {
      updatedProduct = { _id: product._id, qty: 1 };
      // console.log(`this.items a ${JSON.stringify(this.items)}`);
      // console.log(`UPDATED PROD ${JSON.stringify(updatedProduct)}`);
      this.items = [...this.items, updatedProduct];
    }
    this.totalPrice = this.totalPrice + product.price;

  }

  deleteProduct(product, productPrice){

    const existingProductIndex = this.doesProductExistInCart(this.items, product);//CHECKS IF THE NEWLY ENTERED ITEM EXISTS IN THE CART

    const productToBeDeleted = this.items[existingProductIndex];

    //console.log(`Cart.js model - deleteProduct ${JSON.stringify(productToBeDeleted)}`);

    if (!productToBeDeleted){
        return;//smilliar to exit() in php prevents the code from executing further. 
    }  

    const productQty = productToBeDeleted.qty;

    //we loop through all the products and we are returning true if the product Ids do not equal the product being deleted, this will return a new obj. with all the products except the one being deleted - filter(prod => prod.id !== id)  
    this.items = this.items.filter(prod => prod._id.toString() !== product._id.toString());

    //update the cart total
    this.totalPrice = this.totalPrice - productPrice * productQty;

  }

  // static addProduct(id, productPrice) {
  //   // Fetch the previous cart
  //   fs.readFile(p, (err, fileContent) => {
  //     let cart = { products: [], totalPrice: 0 };
  //     if (!err) {
  //       cart = JSON.parse(fileContent);
  //     }
  //     // Analyze the cart => Find existing product
  //     const existingProductIndex = cart.products.findIndex(
  //       prod => prod.id === id
  //     );
  //     const existingProduct = cart.products[existingProductIndex];
  //     let updatedProduct;
  //     // Add new product/ increase quantity
  //     if (existingProduct) {
  //       updatedProduct = { ...existingProduct };
  //       updatedProduct.qty = updatedProduct.qty + 1;
  //       cart.products = [...cart.products];
  //       cart.products[existingProductIndex] = updatedProduct;
  //     } else {
  //       updatedProduct = { id: id, qty: 1 };
  //       cart.products = [...cart.products, updatedProduct];
  //     }
  //     cart.totalPrice = cart.totalPrice + +productPrice;
  //     fs.writeFile(p, JSON.stringify(cart), err => {
  //       console.log(err);
  //     });
  //   });
  // }

  // static deleteProduct(id, productPrice){
  //   fs.readFile(p, (err, fileContent) => {
  //     if (err){//if no cart return
  //       return;
  //     }

  //     const updatedCart = { ...JSON.parse(fileContent) };

  //     //findIndex(prod => prod.id === id); means run through all the products and find the index of the product with the id equal to the ID received in the deleteProduct(id, ) parameter
  //     const product = updatedCart.products.find(prod => prod.id === id);
     
  //     if (!product){
  //       return;//smilliar to exit() in php prevents the code from executing further. 
  //     }
     
  //     const productQty = product.qty;

  //     //we loop through all the products and we are returning true if the product Ids do not equal the product being deleted, this will return a new obj. with all the products except the one being deleted - filter(prod => prod.id !== id)  
  //     updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);

  //     //update the cart total
  //     updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

  //       fs.writeFile(p, JSON.stringify(updatedCart), err => {
  //         console.log(err);
  //       });
  //   });    
  // }

  // static getCart(cb){
  //   fs.readFile(p, (err, fileContent) => {

  //     const cart = JSON.parse(fileContent);

  //     if (err){
  //       cb(null);
  //     } else {
  //       cb(cart);
  //     }
  //   });
  // }

};