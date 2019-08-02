const appConstants = require("../important/constants");

const crypto = require('crypto');//to generate password reset token
const bcrypt = require('bcryptjs');//to encrypt password
const User = require('../models/user');
const nodemailer = require('nodemailer');//to use with sendgrid
const { validationResult } = require('express-validator');
var async = require("async");

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_user: appConstants.sendGridUser,
    api_key: appConstants.sendGridApiKey
  }
}));

// var body = JSON.parse(response.body);

// async.each(body.data, function (photoData, callback) {

//   // ------------------------------------------------
//   // If there is no caption, skip it
//   //

//   if (!photoData.caption){
//     text = '';
//   }
//   else{
//     text = photoData.caption;
//   }

//   // ------------------------------------------------
//   // Create new photo object
//   //

//   var photo = new Photo({
//     link: photoData.link,
//     username: photoData.user.username,
//     profilePicture: photoData.user.profile_picture,
//     imageThumbnail: photoData.images.thumbnail.url,
//     imageFullsize: photoData.images.standard_resolution.url,
//     caption: text,
//     userId: photoData.user.id,
//     date: photoData.created_time,
//     _id: photoData.id
//   });

//   photo.checkBlacklist(function(err, blacklist){

//     if (!blacklist){
//       photo.save(function(err, item){
//         if (err){
//           console.log(err);
//         }

//         console.log('Saved', item);
//         callback();
//       });
//     }

//   });

// }, function (error) {
//   if (error) res.json(500, {error: error});

//   console.log('Photos saved');
//   return res.json(201, {msg: 'Photos updated'} );
// });

const callback = (err) => {
  if(err) console.log(err);
}

// async function asyncForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }

// const startSavingData = async (cartData, userData) => {
//   await asyncForEach(cartData, async (cartObj) => {
//     //await waitFor(50);
//     console.log(`Cart objs ${cartObj}`);
//     await userData.save(cartObj);
//   });
//   console.log('Done');
// }



var combineCarts = function (req, user) {  
  async.waterfall([
      function(next){
          const sessionCart = req.session.cart;
          next(null, sessionCart);
      },
      function(sessionCart, next){
        //https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do
        User.findById(user._id).exec(function (err, userData) {
              next(err, sessionCart, userData);
          });
      },
      function(sessionCart, userData, next){

        const newLoggedInUserCart = userData.cart.items.map((el, i, arr) => {
          return {productId: el.productId, quantity: el.quantity};
        });

        for (var i = 0; i < sessionCart.length; i++) {
          for (var j = 0; j < userData.cart.items.length; j++) {
              if (sessionCart[i]._id.toString() == userData.cart.items[j].productId.toString()){
                  let updatedQty = 0;
                  updatedQty = sessionCart[i].qty + userData.cart.items[j].quantity;
                  //updatedCartObjs.push({productId: sessionCart[i]._id, quantity: updatedQty});
                  sessionCart[i].qty = updatedQty;
              
                }
          
          }

      } 

        const newSessionCart = sessionCart.map((el, i, arr) => {
          return {productId: el._id, quantity: el.qty};
        });

        Array.prototype.unique = function() {
          var a = this.concat();
          for(var i=0; i<a.length; ++i) {
              for(var j=i+1; j<a.length; ++j) {
                  if(a[i].productId.toString() === a[j].productId.toString()){
                      a.splice(j--, 1);
                  }    
              }
          }
      
          return a;
      };

        var combinedCartsWithoutDuplicates = newSessionCart.concat(newLoggedInUserCart).unique();

        const updatedCart = combinedCartsWithoutDuplicates;

        next(null, updatedCart, userData);
      },
      function(updatedCart, userData){

        console.log(`Combined Carts in Auth.js postLogin Controller ${JSON.stringify(updatedCart)}`);
        
        console.log(`userData in Auth.js postLogin Controller ${JSON.stringify(userData)}`);

        console.log(userData._id);

        // userData.clearCart();

        // for(var updatedCartItem in updatedCart){
        //     const userObj = new User();
        //     userObj.findById(userData._id).save(updatedCartItem)
        //       .catch((err)=>{
        //         console.log(err);
        //       });
        // }

        User.findOneAndUpdate({"_id" : userData._id.toString()},  { "$set": { "cart.items": updatedCart } } , { new: true }).exec(function(err, result){
          if(err){console.log(`C - ${err}`)} else{
            console.log(`R - ${result}`);
          };
        });

      }
  ], callback);
};

//const Cart = require('../models/cart');
//importing helpers
//const shopHelper = require('../helpers/shop');

//https://tech.labelleassiette.com/async-js-and-mongoose-js-perfection-76bd8cb14675
// var findData = function (userInput, callback) {  
//   async.waterfall([
//       function(next){
//           ModelA.find(userInput).populate('Alpha').exec(next);
//       },
//       function(modelAResult, next){
//           ModelB.find().in(modelAResult.dataB).exec(function (err, modelBResult) {
//               next(err, modelAResult, modelBResult);
//           });
//       },
//       function(modelAResult, modelBResult, next){
//           /* Post processing data */
//           modelAResult.dataB = modelBResult;
//           next(null, modelAResult);
//       }
//   ], callback);
// };

//https://stackoverflow.com/questions/27567786/asynchronously-loop-through-the-mongoose-collection-with-async-each
// async.waterfall([
//   function (callback) {
//       mongoose.connect("mongodb://localhost/****");
//       var db = mongoose.connection;

//       db.on('error', console.error.bind(console, 'connection error...'));
//       db.once('open', function () {
//           callback(null);
//       });
//   },
//   function(callback){
//       var users = mongoose.model('User', new mongoose.Schema({
//           name: String,
//           age: Number
//       }));

//       users.find(function(err, userFound) {
//           if (err) {
//               return callback(err);
//           }

//           callback(null, userFound);
//       });

//   },
//   function(usersData, callback){
//       async.each(usersData, function(userData, callback) {

//       }, callback);
//   }
// ], function (err, result) {

// });

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login.',
        path: '/login',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        oldInput: {email: '', password: ''}
    });
  };

  exports.postLogin = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array(),
        successMessage: Array(),
        oldInput: {email: email, password: password}
      });
    }
    
    User.findOne({email: email})
      .then(user => {
        if (!user){
          const errors = new Array();
          errors.push({msg: 'Invalid email or password.'});
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors,
            successMessage: Array(),
            oldInput: {email: email, password: password}
          });
        }
          //compare returns a promise
          bcrypt.compare(password, user.password)
          .then(doMatch => {//doMatch returns a boolean value
            if (doMatch){

            //////////////////////////////////////////////////////////////////
            //COMBINING THE GUEST AND LOGGED IN USER CARTS

            //  const productsObjArr = req.session.cart;
             
            //  console.log(` Cart in login ${JSON.stringify(productsObjArr)}`);
             
            //  if (productsObjArr !== undefined){

            //      //user.clearCart();

            //      let promises = [];

            //      productsObjArr.forEach((el, i, arr) => {
            //        promises.push(user.combineCarts(el));//gets not only the title but all product details.
            //      })
          
            //      Promise.all(promises)//get the product details using this promise
            //      .then(result => {
            //        console.log(`Auth.js postLogin ${result}`);
            //      }).catch(err => 
            //        {console.log(`Auth.js postLogin Err ${err}`);
            //        //Dont worry about this error - Can't save() the same doc multiple times in parallel., from what I have read it is a mongo cloud bug
            //      });

                // async.series({
                //   node: node.save,
                //   user:user.save
                // }, function(err, res){
                //      // res is now equal to: {node:node, user:user}
                // });

             //}

            ///////////////////////////////////////////////////////////////////
            
            const productsObjArr = req.session.cart;

            if (productsObjArr !== undefined){
              combineCarts(req, user);
              //return;
            }  

              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {//we are returning to prevent the code below the err=> callback from being executed.
                  console.log(err);
                  res.redirect('/');
              });
            } else {
              const errors = new Array();
              errors.push({msg: 'Invalid email or password.'});
              return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: errors,
                successMessage: Array(),
                oldInput: {email: email, password: password}
              });
            }

          })
          .catch(err => {
            console.log(err);
            res.redirect('/');
          });

      })
      .catch(err => console.log(err));
  };  

  exports.getLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
  };

  exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup.',
        path: '/signup',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        oldInput: {email: '', password: '', confirmpassword: ''}
    });
  };

  exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array(),
        successMessage: Array(),
        oldInput: {email: email, password: password, confirmpassword: req.body.confirmpassword}
      });
    }
  
    bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] }
        });
        return user.save();
      })
      .then(result => {
        res.redirect('/login');
        // return transporter.sendMail({
        //   to: email,
        //   from: 'shop@node-complete.com',
        //   subject: 'Signup succeeded!',
        //   html: '<h1>You successfully signed up!</h1>'
        // });
      })
      .catch(err => {
        console.log(err);
      });
  };


  exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
      pageTitle: 'Reset Password.',
      path: '/reset',
      errorMessage: req.flash('error'),
      successMessage: req.flash('success')                    
    });
  };

  exports.postReset = (req, res, next) => {
    
    crypto.randomBytes(32, (err, buffer) => {

      if (err){
        console.log(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      User.findOne({email: req.body.email})
      .then(user => {
        if (!user){
          req.flash('error', 'That Email does not exist, you can register.');
          return res.redirect('/reset');          
        } else {
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        }
      })
      .then(result => {
        req.flash('success', 'http://localhost:3000/new-password/${token}');//dont use this in production
        res.redirect('/reset');
        return transporter.sendMail({
          to: req.body.email,
          from: 'no-reply@node-js-project.com',
          subject: 'Password Reset!',
          html: `<p>You requested a password reset </p>
                 <p><a href="http://localhost:3000/new-password/${token}">Click Here</a>to do so!</p> 
          `
        })
      })
      .catch(err => {
        console.log(err);
      });
    
    });
  
  };

  exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({resetToken: token, resetTokenExpiration: {$lt: Date.now()}})
    .then(user => {

      if (!user){
        req.flash('error', 'Invalid Token or Token expired.');
        return res.redirect('/reset');//if there is a error I think we can chain another then block here with a flash error message
      }      

      res.render('auth/new-password', {
        pageTitle: 'New Password.',
        path: '/new-password',
        errorMessage: req.flash('error'),
        userId: user._id.toString(),
        token: token,
        resetTokenExpiration: user.resetTokenExpiration                  
      });
    })
    .catch(err => {
      console.log(err);
    });

  };

  exports.postNewPassword = (req, res, next) => {

    const token = req.body.token;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    let user;

    User.findOne({resetToken: token, resetTokenExpiration: {$lt: Date.now()}, _id: userId})
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;      
      resetUser.token = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      req.flash('success', 'Password successfully reset. Please login.');
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });

  };