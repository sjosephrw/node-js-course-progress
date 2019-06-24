const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const MONGO_URI = 'mongodb+srv://joseph:MGL12039487abcde@nodejsproject-wqkqi.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const store = new MongoStore({
    uri: MONGO_URI,
    collection: 'sessions'
}); 

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "GBW10293894756<>?{}_+", 
    resave: false, 
    saveUninitialized: false, 
    store: store
}));

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

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
