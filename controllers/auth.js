const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('dashboard/login', {
    pageTitle: 'Login',
    path: 'dashboard/login',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findByEmail(email)
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.loggedIn = true;
          req.session.user = user;
          return res.redirect('/')
          // req.session.save((err) => {
          //   console.log(err);
          //   return res.redirect('/');
          // });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    // console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  res.render('dashboard/signup', {
    pageTitle: 'Sign Up',
    mainMenuPath: 'signup',
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  return bcrypt.hash(password, 12).then((hashedPassword) => {
    const user = new User(email, hashedPassword);
    user
      .save()
      .then(() => {
        res.redirect('/login');
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
