/* global __dirname */

var express = require('express');
var session = require('express-session');
var parser = require('body-parser');
var config = require('./config');
var Store = require('express-mysql-session');
var app = express();

/* Serve Static Files */
app.use(express.static(__dirname + '/public'));

/* Body-Parser */
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

/* Sessions */
var sessionStore = new Store({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    useConnectionPooling: true
});
app.use(session({
    secret: config.session.secret,
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    cookie: {
        httpOnly: false
    }
}));

/* View Engine */
app.set('view engine', 'jade');

/* Routes */
app.use('/', require('./routes/'));
app.use('/api', require('./routes/api/'));
app.use('/login', require('./routes/login'));
app.use('/recover', require('./routes/recover'));
app.use('/service', require('./routes/service'));
app.use('/register', require('./routes/register'));
app.use('/dashboard', require('./routes/dashboard'));

app.listen(2000, function () {console.log('**SERVER RUNNING')});