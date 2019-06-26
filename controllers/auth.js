const crypto = require('crypto');//to generate password reset token
const bcrypt = require('bcryptjs');//to encrypt password
const User = require('../models/user');
const nodemailer = require('nodemailer');//to use with sendgrid

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_user: 'sjosephwr12',
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login.',
        path: '/login',
        errorMessage: req.flash('error')       
    });
  };

  exports.postLogin = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
      .then(user => {
        if (!user){
          req.flash('error', 'Invalid Email or password');
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
        errorMessage: req.flash('error')                  
    });
  };

  exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    User.findOne({email: email})
    .then(userDoc => {
      if (userDoc){
        req.flash('error', 'That Email already exists, please pick a different one');
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
      return transporter.sendMail({
        to: email,
        from: 'shop@node-js-project.com',
        subject: 'Registration Successful!',
        html: '<h1>Registration Successful.</h1>'
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });

  };


  exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
      pageTitle: 'Reset Password.',
      path: '/reset',
      errorMessage: req.flash('error')                  
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
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'no-reply@node-js-project.com',
          subject: 'Password Reset!',
          html: `<p>You requested a password reset </p>
                 <p><a href="http://localhost:3000/reset/${token}">Click Here</a>to do so!</p> 
          `
        })
      })
      .catch(err => {
        console.log(err);
      });
    
    });
  
  };