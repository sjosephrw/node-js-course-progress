import {appConstants} from "./constants";

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const fileStorage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' +file.originalname);//to prvent imagees from being overwritten
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

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('imageUrl'));

app.use(express.static(path.join(__dirname, 'public')));
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  //res.locals.csrfToken = req.csrfToken(); 
  res.locals.csrfToken = req["csrfToken"] ? req.csrfToken() : "";//checking if there is a csrf token  
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// app.use('/500', errorController.get500);
// //error handling middle ware this middle ware has a 4th parameter - the error parameter, if you have
// //more than 1 error handling middle ware they will skip from top to bottom, just like the other middle wares.
// app.use((error, req, res, next) => {
//   res.redirect('/500');
// });

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

    app.listen(3000);
}).catch(err => {
    console.log(err);
});
