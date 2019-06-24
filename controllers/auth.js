const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login.',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn        
    });
  };

  exports.postLogin = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
      .then(user => {
        if (!user){
          return res.redirect('/login');//if there is a error I think we can chain another then block here with a flash error message
        }
          //compare returns a promise
          bcrypt.compare(password, user.password)
          .then(doMatch => {//doMatch returns a boolean value
            if (doMatch){
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {//we are returning to prevent the code below the err=> callback from being executed.
                  console.log(err);
                  res.redirect('/');
              });
            }
            res.redirect('/login');//no need to return here because we need to check the catch block err code if any errors exist.
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
        isAuthenticated: req.session.isLoggedIn        
    });
  };

  exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    User.findOne({email: email})
    .then(userDoc => {
      if (userDoc){
        return res.redirect('/signup');//we will redirect to sign up and return to prevent the code below from being executed
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items:[] }
      });
      return user.save();//we are returning here so we can chain another then() block below
    })
    .then(result => {
      res.redirect('/login');      
    })
    .catch(err => {
      console.log(err);
    });

  };
