
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/user');
const { check, body } = require('express-validator');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const ADMIN_CODE = "adminkey"

var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hahuynhim2003@gmail.com',
    pass: 'ctaengknsxxvnkch',
  },
});

exports.getLogin = (req, res, next) => {
  // let message = req.flash('error');
  // if (message.length > 0) {
  //   message = message[0];
  // } else {
  //   message = null;
  // }
  message = null
  res.render('login', {
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('login', {
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('login', {
          pageTitle: 'Login',
          errorMessage: "This account doesn't exist",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
                res.redirect('/admin');
            });
          }
          return res.status(422).render('login', {
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password',
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('login');
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('signup', {
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const adminCode = req.body.adminCode;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('signup', {
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  if (adminCode == ADMIN_CODE && password == confirmPassword) {
    bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
        });
        return user.save();
      })
      .then(result => {
        res.redirect('login');
        // return transporter.sendMail({
        //   to: email,
        //   from: 'hahuynhim2003@gmail.com',
        //   subject: 'Signup Successded !',
        //   html: '<h1> You successfully signed up!</h1>'
        // });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  } else {
    return res.status(422).render('signup', {
      pageTitle: 'Signup',
      errorMessage: 'Incorrect admin code',
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: [],
    });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/login');
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('reset-password', {
    pageTitle: 'Reset Password',
    errorMessage: message,
    oldInput: {
      email: '',
    },
    validationErrors: [],
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset-password');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found!');
          return res.redirect('/reset-password');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'hahuynhim2003@gmail.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset </p>
            <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password
            `,
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('new-password', {
        pageTitle: 'New Password',
        errorMessage: message,
        userEmail: user.email,
        userId: user._id.toString(),
        passwordToken: token,
        validationErrors: [],
        oldInput: {
          email: '',
          password: req.body.password,
          confirmPassword: req.body.confirmPassword,
        },
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const errors = validationResult(req);
  let resetUser;
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('new-password', {
      pageTitle: 'New Password',
      errorMessage: errors.array()[0].msg,
      userId: userId,
      passwordToken: passwordToken,
      validationErrors: errors.array(),
      oldInput: {
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
    });
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};