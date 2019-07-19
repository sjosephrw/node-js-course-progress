const express = require('express');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',    [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ], authController.postLogin);

router.get('/logout', authController.getLogout);

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
      check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
          // if (value === 'test@test.com') {
          //   throw new Error('This email address if forbidden.');
          // }
          // return true;
          return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
              return Promise.reject(
                'E-Mail exists already, please pick a different one.'
              );
            }
          });
        })
        .normalizeEmail(),
      body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
      )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
      body('confirmpassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
    ],
    authController.postSignup
  );
  
router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;