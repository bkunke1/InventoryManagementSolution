const path = require('path');

const express = require('express');

const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

const mongoConnect = require('./util/database').mongoConnect;

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(adminRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
});