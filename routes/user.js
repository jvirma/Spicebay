var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var Customer = require('../models/customerModel');
var Order = require('../models/shopOrder');
var order = new Order();

function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join(" / ");
}


//PROFILE
router.get('/profile', isLoggedIn, function (req, res, next) {


    req.user.createdAt = convert(req.user.createdAt);
    req.user.updatedAt = convert(req.user.updatedAt);
    res.render('user/profile', {csrfToken: req.csrfToken(), data: req.user});
});

//PROFILE DELETE
router.post('/profile', isLoggedIn, function (req, res, next) {
    var customer = new Customer();
    customer.deleteAccount(req, function (err, res) {
        if (err) {
            //req.flash('error', err.message);
        }
        else {
            //req.flash('success', 'Successfully bought products! Check your orders on profile page!');
        }
    });
    req.logout();
    res.writeHead(302, {
        'Location': '/',
    });
    res.end();
});



//UPDATE
router.get('/update', isLoggedIn, function (req, res, next) {
    //var errMsg = req.flash('error')[0];
    res.render('user/update', {csrfToken: req.csrfToken(), data: req.user});
});

router.post('/update', function (req, res, next) {
    var customer = new Customer();
    customer.updateInformation(req, function (err, res) {
        if (err) {
        }
        else {
        }
    });
    res.writeHead(302, {
        'Location': '/user/profile',
    });
    res.end();

});

//ORDERS
router.get('/myorders', isLoggedIn, function (req, res, next) {
    var orderinfos = [];
    var products = [];
    var ordersProducts = [];
    var temp = [];
    order.getOrders(req, function (err, result) {
        if (err) console.log("Database error!");
        else {
            orderinfos = result;
            order.getOrdersProducts(function (err, result) {
                    if (err) console.log("Database error!");
                    else {
                        products = result;
                        for (i in orderinfos) {
                            for (j in products) {
                                if (orderinfos[i].ID == products[j].orderID)
                                    temp.push(products[j]);
                                    
                            }
                            ordersProducts.push({ orderinfo: orderinfos[i], products: temp});
                            temp = [];
                        }
                        return res.render('user/myorders', { orderinfos: orderinfos, ordersProducts: ordersProducts});
                    }
                },req);
        }
    });
    
    
});



//logout
router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});


//SIGNUP
router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}));


//SIGNIN
router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});
router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
