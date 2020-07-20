const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://nodeUser:dUbgzK1wfxJfHzUI@cluster0-5kdcc.mongodb.net/masterERP';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

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

// app.use((req, res, next) => {
//   User.findById('5f0909cc14b85563e84abb0a')
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

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

mongoConnect(() => {
  app.listen(3000);
});
