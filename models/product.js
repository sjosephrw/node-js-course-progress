//const products = [];
// const fs = require('fs');
// const path = require('path');
// const Cart = require('./cart');

// const rootDir = require('../util/path');
// const p = path.join(rootDir, 'data', 'products.json');
const mongo = require('mongodb');
const getDb = require('../util/database').getDb;

// const getProductsFromFile = (cb) => {

//     fs.readFile(p, (err, fileContent) => {
//         console.log(err);

//         if (err){//if the products.json file exists
//             return cb([]);
//         } else {
//             return cb(JSON.parse(fileContent));
//         }

//     }); 
// }

module.exports = class Product {
    
    constructor(title, imageUrl, price, description, id, userId){   
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;      
        this.description = description;                          
        this._id = id ? new mongo.ObjectId(id) : null;
        this.userId = userId;        
    }

    save() {
        // getProductsFromFile(products => {
        //   if (this.id) {
        //     const existingProductIndex = products.findIndex(
        //       prod => prod.id === this.id
        //     );
        //     const updatedProducts = [...products];
        //     updatedProducts[existingProductIndex] = this;
        //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        //       console.log(err);
        //     });
        //   } else {
        //     this.id = Math.random().toString();
        //     products.push(this);
        //     fs.writeFile(p, JSON.stringify(products), err => {
        //       console.log(err);
        //     });
        //   }
        // });

        const db = getDb();
        let dbOp;

        if (this._id){
          dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this})
        } else {
          dbOp = db.collection('products').insertOne(this);
        }

        //.insertOne({id: 1, price: "10.00"});//to insert one item
        //.insertOne([{}]);//to insert many items include a array of objects
        //or insertOne(this); to insert the object created by the constructor function.
        return dbOp.then(result => {
          console.log(result);
        }).catch(err => {
          console.log(err);
        });//the products collection will be created automatically no need to create it manually
      }

    static deleteById(id){

        // getProductsFromFile(products => {
        //   const product = products.find(prod => {
        //     prod.id === id;
        //   }); 
        //     //get all the products and find() the object that has the id equal to the id passed in as a parameter above
        //     const updatedProducts = products.filter(p => p.id !== id);
        //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        //         console.log(err);
        //         if (!err){
        //           Cart.deleteProduct(id, product.price);
        //         }

        //     });
        // });   
        
        const db = getDb();  
        db.collection('products').deleteOne({_id: new mongo.ObjectId(id)})
        .then(resulot => {
          console.log('DELETED');
        })
        .catch(err => {
          console.log(err);
        });
    }  

    static fetchAll(){

        //getProductsFromFile(cb);
        const db = getDb();        
        return db
        .collection('products')
        .find()
        .toArray()
        .then(products => {
          console.log(products);
          return products;
        })
        .catch(err => {
          console.log(err);
        });
    }

    static findById(prodId){

        // getProductsFromFile(products => {
        //     //get all the products and find() the object that has the id equal to the id passed in as a parameter above
        //     const product = products.find(p => p.id === id);
        //     cb(product);
        // });

        const db = getDb();
        return db
          .collection('products')
          .find({ _id: new mongo.ObjectId(prodId) })
          .next()
          .then(product => {
            console.log(`findById ${product}`);
            return product;
          })
          .catch(err => {
            console.log(err);
          });

    }



}