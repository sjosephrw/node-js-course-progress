import {appConstants} from "../../constants";

const crypto = require('crypto');//to generate password reset token
const bcrypt = require('bcryptjs');//to encrypt password
const User = require('../models/user');
const nodemailer = require('nodemailer');//to use with sendgrid
const { validationResult } = require('express-validator');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_user: appConstants.sendGridUser,
    api_key: appConstants.sendGridApiKey
  }
}));

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