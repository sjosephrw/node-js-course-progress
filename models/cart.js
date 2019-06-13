const fs = require('fs');
const path = require('path');


const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        prod => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // Add new product/ increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice){
    fs.readFile(p, (err, fileContent) => {
      if (err){//if no cart return
        return;
      }

      const updatedCart = { ...JSON.parse(fileContent) };

      //findIndex(prod => prod.id === id); means run through all the products and find the index of the product with the id equal to the ID received in the deleteProduct(id, ) parameter
      const product = updatedCart.products.find(prod => prod.id === id);
     
      if (!product){
        return;//smilliar to exit() in php prevents the code from executing further. 
      }
     
      const productQty = product.qty;

      //we loop through all the products and we are returning true if the product Ids do not equal the product being deleted, this will return a new obj. with all the products except the one being deleted - filter(prod => prod.id !== id)  
      updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);

      //update the cart total
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

        fs.writeFile(p, JSON.stringify(updatedCart), err => {
          console.log(err);
        });
    });    
  }

  static getCart(cb){
    fs.readFile(p, (err, fileContent) => {

      const cart = JSON.parse(fileContent);

      if (err){
        cb(null);
      } else {
        cb(cart);
      }
    });
  }

};