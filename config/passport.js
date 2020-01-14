var LocalStrategy = require("passport-local").Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var connections = require('./connectionChooser');
const uuidv1 = require('uuid/v1');





module.exports = function (passport) {
    const connection = connections.getDefaultConnection();

    passport.serializeUser(function (user, done) {
        done(null, user.ID);
    });

    passport.deserializeUser(function (id, done) {
        connection.query("SELECT * FROM Customer WHERE ID = ?", [id],
            function (err, rows) {
                done(err, rows[0]);
            });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, email, password, done) {
                req.checkBody('email', 'Invalid email').notEmpty().isEmail();
                req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
                var errors = req.validationErrors();
                if (errors) {
                    var messages = [];
                    errors.forEach(function (error) {
                        messages.push(error.msg)
                    })
                    return done(null, false, req.flash('error', messages));
                }

                connection.query("SELECT * FROM Customer WHERE email = ? ",
                    [email], function (err, rows) {
                        if (err)
                            return done(err);
                        if (rows.length) {
                            return done(null, false, req.flash('error', 'Email is already taken'));
                        } else {
                            var newUserMysql = {
                                email: email,
                                password: bcrypt.hashSync(password, null, null),
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                ID: uuidv1()
                            };

                            var insertQuery = "INSERT INTO Customer (ID, email, firstName, lastName, passwordHash) values (?, ?,?,?,?)";

                            connection.query(insertQuery, [newUserMysql.ID, newUserMysql.email, newUserMysql.firstName, newUserMysql.lastName, newUserMysql.password],
                                function (err, rows) {
                                    if (err)
                                        console.log(err);
                                    return done(null, newUserMysql);
                                });
                        }
                    });
            })
    );

    passport.use(
        'local-signin',
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
            function (req, email, password, done) {
                req.checkBody('email', 'Invalid email').notEmpty().isEmail();
                req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
                var errors = req.validationErrors();
                if (errors) {
                    var messages = [];
                    errors.forEach(function (error) {
                        messages.push(error.msg)
                    })
                    return done(null, false, req.flash('error', messages));
                }

                connection.query("SELECT * FROM Customer WHERE email = ?", [email],
                    function (err, rows) {
                        if (err)
                            return done(err);
                        if (!rows.length) {
                            return done(null, false, req.flash('error', 'No User Found'));
                        }
                        if (!bcrypt.compareSync(password, rows[0].passwordHash))
                            return done(null, false, req.flash('error', 'Wrong Password'));

                        

                        return done(null, rows[0]);
                    });
            })
    );
};