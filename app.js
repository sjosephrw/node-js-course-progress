const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5d0dff0f5c11da15e9a68720')
    .then(user => {
        //req.user = user;//entering the user Obj. into the request
        req.user = user;
        console.log(`This is in the request ${req.user._id}`);
        next();
    })
    .catch(err => {console.log(err);});
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() => {
//     app.listen(3000);
// });

mongoose
.connect('mongodb+srv://joseph:MGL12039487abcde@nodejsproject-wqkqi.mongodb.net/shop?retryWrites=true&w=majority', {useNewUrlParser: true })
.then(result => {
    User.findOne().then(user => {
        if (!user){
            const user = new User({
                name: 'Michael',
                email: 'michael@test.com',
                cart: {
                    items: []
                } 
            });
            user.save();
        }
    });

    app.listen(3000);
}).catch(err => {
    console.log(err);
});
