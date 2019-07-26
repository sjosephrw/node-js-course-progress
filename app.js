const appConstants = require("./important/constants");

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);//passing the app.use(session({ middle ware in here
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const fileStorage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' +file.originalname);//to prvent images from being overwritten
  }

  });

const fileFilter = (req, file, cb) => {

  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
    cb(null, true);
  } else {
    cb(null, false);
  }

};

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const MONGO_URI = appConstants.dbConnectionUri;

const app = express();
const store = new MongoStore({
    uri: MONGO_URI,
    collection: 'sessions'
}); 

const csrfProtection = csrf({});//the secret token used to hash the csrf token
//*********************** IMPORTANT - what is a middleware in node js - google search term
//https://medium.com/@jamischarles/what-is-middleware-a-simple-explanation-bb22d6b41d01
app.set('view engine', 'ejs');//Third-party Middlewares Not Sure
app.set('views', 'views');//Third-party Middlewares Not Sure

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));//Third-party Middlewares
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('imageUrl'));//Third-party Middlewares

//Third-party Middlewares, not sure
app.use(express.static(path.join(__dirname, 'public')));
//Third-party Middlewares, not sure
app.use('/public/img', express.static(path.join(__dirname, '/public/img')));//without this the images wont show


app.use(session({
    secret: appConstants.appSecret, 
    resave: true, //intially this was false
    saveUninitialized: true, //initially this was false
    store: store,
    cookie: { maxAge: 12 * 60 * 60 * 1000 }
}));

//app.use(csrfProtection);

app.use((req, res, next) => {
  if (req.url === "/create-orders") {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});

app.use(flash());//this has to be initialized below the session middle ware decalred above

/////////////////////////////////////
// Defining middleware
// function myMiddleware(req, res, next) {
//   req.session.cart ? req.session.cart : [];
//   next();
// }
// // Using it in an app for all routes (you can replace * with any route you want)
// app.use('*', myMiddleware)

/////////////////////////////////////

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if (!user){
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        //throw new Error(err);//don't write this inside async code (Promises, then , catch and callbacks) use the line below
        next(new Error(err));
      });
  });

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;//making the authentication status available in the views
  //res.locals.csrfToken = req.csrfToken(); //if the req contains the csrftoken then the res must contain the csrf token (not sure), making it accessible in the views
  res.locals.csrfToken = req["csrfToken"] ? req.csrfToken() : "";//checking if there is a csrf token in the req if it does get it, making it accessible in the views 
  res.locals.session = req.session; //making the session object accessible by the views
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//Error Handing Middleware
// app.use('/500', errorController.get500);
// //error handling middle ware this middle ware has a 4th parameter - the error parameter, if you have
// //more than 1 error handling middle ware they will skip from top to bottom, just like the other middle wares.
// app.use((error, req, res, next) => {
//   res.redirect('/500');
// });

//Error Handing Middleware
app.use(errorController.get404);


// mongoConnect(() => {
//     app.listen(3000);
// });

mongoose
.connect(MONGO_URI, {useNewUrlParser: true })
.then(result => {
    // User.findOne().then(user => {
    //     if (!user){
    //         const user = new User({
    //             name: 'Michael',
    //             email: 'michael@test.com',
    //             cart: {
    //                 items: []
    //             } 
    //         });
    //         user.save();
    //     }
    // });

    //Logging middle ware (Does not have a next function)
    // app.listen(3000,(req,res)=>{
    //   console.log('server running on port 3000')
    // });

    app.listen(3000);
}).catch(err => {
    console.log(err);
});
