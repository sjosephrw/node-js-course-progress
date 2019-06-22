// const mongo = require('mongodb');
// const getDb = require('../util/database').getDb;

// module.exports = class Product {
    
//     constructor(title, imageUrl, price, description, id, userId){   
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;      
//         this.description = description;                          
//         this._id = id ? new mongo.ObjectId(id) : null;
//         this.userId = userId;        
//     }

//     save() {

//         const db = getDb();
//         let dbOp;

//         if (this._id){
//           dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this})
//         } else {
//           dbOp = db.collection('products').insertOne(this);
//         }

//         //.insertOne({id: 1, price: "10.00"});//to insert one item
//         //.insertOne([{}]);//to insert many items include a array of objects
//         //or insertOne(this); to insert the object created by the constructor function.
//         return dbOp.then(result => {
//           console.log(result);
//         }).catch(err => {
//           console.log(err);
//         });//the products collection will be created automatically no need to create it manually
//       }

//     static deleteById(id){        
//         const db = getDb();  
//         db.collection('products').deleteOne({_id: new mongo.ObjectId(id)})
//         .then(resulot => {
//           console.log('DELETED');
//         })
//         .catch(err => {
//           console.log(err);
//         });
//     }  

//     static fetchAll(){

//         //getProductsFromFile(cb);
//         const db = getDb();        
//         return db
//         .collection('products')
//         .find()
//         .toArray()
//         .then(products => {
//           console.log(products);
//           return products;
//         })
//         .catch(err => {
//           console.log(err);
//         });
//     }

//     static findById(prodId){

//         const db = getDb();
//         return db
//           .collection('products')
//           .find({ _id: new mongo.ObjectId(prodId) })
//           .next()
//           .then(product => {
//             console.log(`findById ${product}`);
//             return product;
//           })
//           .catch(err => {
//             console.log(err);
//           });

//     }

// }

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true    
  },
  imageUrl: {
    type: String,
    required: true    
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);