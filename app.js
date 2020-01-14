var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mysql = require('mysql');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var app = module.exports = express();
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');

var app = express();

require('./config/passport')(passport);

// view engine setup
app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(validator());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

var options = {
    host: "remotemysql.com",
    user: "g39SwdPcnM",
    password: "xNaEORgN4K",
    database: "g39SwdPcnM",
    port: "3306"
};

app.use(session({
    key: 'sessionkey',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(options)
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})
app.get('/documents/:format/:type', function (req, res) {
    var format = req.params.format,
        type = req.params.type;
});

app.use('/user', userRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
