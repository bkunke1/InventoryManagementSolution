const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://nodeUser:dUbgzK1wfxJfHzUI@cluster0-5kdcc.mongodb.net/masterERP';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf({});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// setting locals is the same as adding them to every response in the controllers
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.userEmail = req.session.user ? req.session.user.email : null;
  next();
});

// Unnecessary code to remind me different ways to use middleware
app.use((req, res, next) => {
  // req.testValue = "testing..testing";
  // console.log(req.testValue);
  // console.log(req.session.loggedIn);
  // console.log(req.session.user);
  next();
});

app.use(adminRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
