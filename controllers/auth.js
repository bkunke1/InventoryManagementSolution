// node library used to help creating secure unique random values
const crypto = require('crypto');

// node library used to hash user passwords
const bcrypt = require('bcryptjs');

// node library used to help send emails
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

// initializing sendgrid to send emails
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        `${process.env.SENDGRID_API_KEY}`,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: 'dashboard/login',
    message: message,
    errorMessage: error,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: 'dashboard/login',
      errorMessage: errors.array()[0].msg,
      message: null,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // req.flash('error', 'Invalid email or password.'); no longer need to flash the message since it is in errorMessage below..
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: 'dashboard/login',
          errorMessage: 'Invalid email or password.',
          message: null,
          oldInput: { email: email, password: password },
          validationErrors: [], //leaving off as to not indicate which input was incorrect
        });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.loggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log('Login errors:', err);
            return res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.');
        // res.redirect('/login');
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: 'dashboard/login',
          errorMessage: 'Invalid email or password.',
          oldInput: { email: email, password: password },
          validationErrors: [], //leaving off as to not indicate which input was incorrect
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('Log out errors:', err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    mainMenuPath: 'signup',
    errorMessage: message,
    oldInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Sign Up',
      mainMenuPath: 'signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      console.log(email);
      const user = new User({
        email: email,
        password: hashedPassword,
        role: 'admin',
      });
      return user.save();
    })
    // uncomment with sendgrid bug is fixed
    .then(() => {
      transporter.sendMail({
        to: email,
        from: 'brandon@customwebware.com',
        subject: 'Custom Webware signup success!',
        html: '<h1>You successfully signed up!</h1> <a href="http://www.customwebware.com/unsubscribe">Unsubscribe</a>',
        text: '4451 Derby Ln SE Smyrna, GA 30082 407-698-6113'
      });
      console.log('signup confirmation email sent');
      return res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    mainMenuPath: 'resetPassword',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const email = req.body.email;
    const token = buffer.toString('hex');
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        req.flash('message', 'Reset email has been sent!');
        res.redirect('/login');
        console.log('password reset sent to:', email);
        transporter.sendMail({
          to: email,
          from: 'brandon@customwebware.com',
          subject: 'Password Reset!',
          html: `
          <p>You requested a password reset.</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        pageTitle: 'New Password',
        mainMenuPath: 'newPassword',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postNewPassword = (req, res, next) => {
//   const newPassword = req.body.password;
//   const userId = req.body.userId;
//   const passwordToken = req.body.passwordToken;
//   let resetUser;

//   User.findOne({
//     resetToken: passwordToken,
//     resetTokenExpiration: { $gt: Date.now() },
//     _id: userId,
//   })
//     .then((user) => {
//       resetUser = user;
//       return bcrypt.hash(newPassword, 12);
//     })
//     .then((hashedPassword) => {
//       console.log(hashedPassword);
//       resetUser.password = hashedPassword;
//       resetUser.resetToken = undefined;
//       resetUser.resetTokenExpiration = undefined;
//       resetUser.save();
//     })
//     .then((result) => {
//       res.redirect('/login');
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  console.log('newPassword', newPassword, 'userId', userId, 'passwordToken', passwordToken);

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      console.log(user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
