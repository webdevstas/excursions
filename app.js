const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const crypto = require('crypto')
const { Users } = require('./models/users')

require('dotenv').config()
const indexRouter = require('./routes/index');
const companiesFormRouter = require('./routes/companiesForm');
const excurionsFormRouter = require('./routes/excursionsForm');
const companiesListRouter = require('./routes/companiesList');
const excursionsListRouter = require('./routes/excursionsList');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const apiRouter = require('./routes/api');

const mongoose = require('mongoose');
const passport = require('passport');
const genPassword = require('./lib/passportUtils').genPassword
const validPassword = require('./lib/passportUtils').validPassword

//const db = mongoose.connect('mongodb://mongodb:27017/test', {useNewUrlParser: true, useUnifiedTopology: true, user: 'moder', pass: '123456789'}) //production
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true, user: process.env.DB_USER, pass: process.env.DB_PWD }) // development
const db = mongoose.connection
const MongoStore = require('connect-mongo')(session)

db.on('error', console.error.bind(console, 'CONNECTION ERROR'))

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session
const sessionStore = new MongoStore({
  mongooseConnection: db,
  collection: 'sessions'
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))

// create a user
// app.use(async function(){
//   let pwdHash = genPassword('excursions_moderator')
//   const user = {
//     username: 'moderator',
//     salt: pwdHash.salt,
//     hash: pwdHash.hash
//   }
//   Users.create(user, err => {
//     console.log(err);
//   })
// })

// auth
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

// Routs
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/register-company', companiesFormRouter);
app.use('/new-excursion', excurionsFormRouter);
app.use('/companies-list', companiesListRouter);
app.use('/excursions-list', excursionsListRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
