const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('dashboard/login', {
    pageTitle: 'Login',
    path: 'dashboard/login',
  });
};

exports.postLogin = (req, res, next) => {
  //   res.setHeader('Set-Cookie', 'loggedIn=true');
  User.findById('5f15065433779a64384c73df')
    .then((user) => {
      req.session.loggedIn = true;
      req.session.user = user;
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
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
