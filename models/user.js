// const mongo = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongo.ObjectId;

// class User {
//     constructor(username, email, cart, id){
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     } 

//     addToCart(product){

//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return new ObjectId(cp.productId).toString() === product._id.toString();
//         });
        
//           let newQuantity = 1;
//           const updatedCartItems = [...this.cart.items];
      
//           if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//           } else {
//             updatedCartItems.push({
//               productId: new ObjectId(product._id),
//               quantity: newQuantity
//             });
//           }
//           const updatedCart = {
//             items: updatedCartItems
//           };
//           const db = getDb();
//           return db
//             .collection('users')
//             .updateOne(
//               { _id: new ObjectId(this._id) },
//               { $set: { cart: updatedCart } }
//             );
//     }

//     getCart(){
//       const db = getDb();
//       const productIds = this.cart.items.map(i => {
//         return i.productId;
//       });      
    
//       return db.collection('products').find({_id: {$in: productIds}})
//       .toArray()
//       .then(products => {
//         return products.map(p => {
//           return {
//             ...p,
//             imageUrl: p.imageUrl, 
//             quantity: this.cart.items.find(i => {//*************IMPORTANT - IS THIS NECESSARY
//                return i.productId.toString() === p._id.toString(); 
//             }).quantity
//           };
//         });
//       })
//       .catch(err => {console.log(err);});    
    
//     }

//     deleteItemFromCart(productId){
//       const updatedCartItems = this.cart.items.filter(items => {
//         return items.productId.toString() !== productId;
//       });

//       const db = getDb();
//       return db
//         .collection('users')
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: {items: updatedCartItems }}}
//         );

//     }

//     addOrder(){
//       const db = getDb();
//       return this.getCart()
//       .then(products => {
//         const orders = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
  
//           }
//         }
//         return db.collection('orders').insertOne(orders);
//       })
//       .then(result => {
//         this.cart = {items: []};
//         return db
//         .collection('users')
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: {items: [] }}}
//         );

//       })
//       .catch(err => {
//           console.log(err);
//       });      
//     }

//     getOrders(){
//       const db = getDb();
//       return db.collection('orders')
//       .find({'user._id': new ObjectId(this._id)})
//       .toArray();      
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new ObjectId(userId)})
//         .then(user => {
//             console.log(user);
//             return user;
//         })
//         .catch(err => {
//             console.log(err);
//         });
//     }
// }

// module.exports = User

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true    
  },
  password: {
    type: String,
    required: true
  },  
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity: {type: Number, required: true}
      }
    ]   
  }
});

userSchema.methods.addToCart = function(product){

    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    
      let newQuantity = 1;
      const updatedCartItems = [...this.cart.items];
  
      if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
      } else {
        updatedCartItems.push({
          productId: product._id,
          quantity: newQuantity
        });
      }
      const updatedCart = {
        items: updatedCartItems
      };
      this.cart = updatedCart;
      return this.save();  
}

    userSchema.methods.removeFromCart = function(product){
      const updatedCartItems = this.cart.items.filter(items => {
        return items.productId.toString() !== product;
      });

      this.cart.items = updatedCartItems;
      return this.save();

    }

    userSchema.methods.clearCart = function(){
      this.cart = { items: [] };
      return this.save();
    }

    // userSchema.methods.combineCarts = function(cartObj){
    //   this.cart = { items: cartObj };
    //   return this.save();
    // }    

  //combine guest user and logged in user carts
//   userSchema.methods.combineCarts = function(product){

//     const cartProductIndex = this.cart.items.findIndex(cp => {
//         return cp.productId.toString() === product._id.toString();
//     });
    
//       let newQuantity = 0;
//       const updatedCartItems = [...this.cart.items];
  
//       if (cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + product.qty;
//         updatedCartItems[cartProductIndex].quantity = newQuantity;
//       } else {
        
//         let newQuantity = 1;

//         updatedCartItems.push({
//           productId: product._id,
//           quantity: newQuantity
//         });
//       }
//       const updatedCart = {
//         items: updatedCartItems
//       };
//       this.cart = updatedCart;
      
//       // return this.save()
//       // .then((data)=>{
//       //   console.log(`User Model ${data}`);
//       // }).catch((error)=>{
//       //   console.log(`User Model ${error}`);
//       // });  

//       return this.save();
// }

//'User' - the db collection name mongoose converts it to lowercase 'user' to get the collection name
module.exports = mongoose.model('User', userSchema);