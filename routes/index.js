var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var Cart = require('../models/cart');
var Product = require('../models/Product');
var Order = require('../models/shopOrder');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
var regions = ['India', 'Canada', 'Finland'];

var docs = [];
var categories = [];
var totalAmounts = {}
var amounts = [];
var product = new Product();


product.getCategories(function (err, result) {
    if (err) console.log("Database error!");
    else
        categories = result;

});

product.getProducts(function (err, result) {
    if (err) console.log("Database error!");
    else {
        docs = result.map(item => {
            const path = 'images/products/';
            if (fs.existsSync(`public/${path}${item.ID}.png`)) {
                return { ...item, imagePath: `${path}${item.ID}.png` }
            }
            console.warn('Could not find product image for', `public/${path}${item.ID}.png`);
            return { ...item, imagePath: `${path}default.png` };
        });
    }
});

/*Hard coded demo solutions*/
product.getProductAmounts('India', function(err, result) {
  if (err) console.log("Database error!");
  else {
      amounts.push(result);
      product.getProductAmounts('Canada', function(err, result) {
          if (err) console.log("Database error!");
          else {
            amounts.push(result);
            product.getProductAmounts('Finland', function(err, result) {
                  if (err) console.log("Database error!");
                  else {
                      amounts.push(result);
                  }
              });
          }
      });
  }
});


router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    var productChunks = [];
    var chunkSize = 3;
    var temp;

    for (var i = 0; i < amounts.length; i++) {
        temp = amounts[i];
        console.log(temp);
        for (var j = 0; j < temp.length; j++) {

          if (temp[j].ID in totalAmounts) {
              totalAmounts[temp[j].ID] += temp[j].amount;
          } else {
              totalAmounts[temp[j].ID] = temp[j].amount;
          }
        }
    }
    //console.log(totalAmounts);
    for (d in docs) {
        if (docs[d].ID in totalAmounts) {
            docs[d].amount = totalAmounts[docs[d].ID];
        } else {
            docs[d].amount = 0;
        }
    }
    console.log(docs);

    for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
    }

    res.render('shop/index', { products: productChunks, categories: categories, successMsg: successMsg, noMessages: !successMsg, noUserArea: !req.session.userArea });
});
router.post('/', function (req, res, next) {
    req.session.userArea = req.body.areaRadios;
    res.redirect('/');
});






router.get('/shoppingcart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shoppingcart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shoppingcart', { products: cart.generateArray(), totalPrice: cart.totalPrice.toFixed(4) });
});


router.get('/checkout', isLoggedIn, function (req, res, next) {
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.post('/checkout', function (req, res, next) {

    var cart = new Cart(req.session.cart);
    var paymentID = uuidv4();
    var shopOrderID = uuidv4();
    var orderData = {
        paymentID: paymentID,
        shopOrderID: shopOrderID,
        customer: req.user.ID,
        cart: cart
    };
    var order = new Order();
    order.savePayment(orderData, function (err, result) {
        if (err) {
            req.flash('error', err.message);
        }
        else {
            order.saveShopOrder(orderData, function (err, result) {
                if (err) {
                    req.flash('error', err.message);
                }
                else {
                    order.saveOrderContains(orderData, function (err, result) {
                        if (err) {
                            req.flash('error', err.message);
                        }
                        else {
                            req.flash('success', 'Successfully bought products!');
                            req.session.cart = null;
                            res.redirect('/');
                        }
                    }, req);
                }
            }, req);
        }
    }, req);

});

router.post('/addtocart/:id', function (req, res, next) {

    var productId = req.params.id;

    var cart = new Cart(req.session.cart ? req.session.cart : {});
    for (doc in docs) {
        if (docs[doc].ID == productId) {
            cart.add(docs[doc], docs[doc].ID);
            req.session.cart = cart;
        }
    }

    res.send(cart);
});

router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;

    res.redirect('/shoppingcart');
});

router.post('/update/:id/:quantity', function (req, res, next) {
    var productId = req.params.id;
    var quantity = parseInt(req.params.quantity);
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.updateCart(productId, quantity);
    req.session.cart = cart;
    res.send(cart);
});

router.get('/:ID', function (req, res, next) {
    var filtered = [];
    var categoryInfo = [];
    var categoryId = req.params.ID;

    categoryInfo = categories.find(category => category.ID === categoryId);

    // Non-existent/404, redirect to root
    if (!categoryInfo) {
        res.redirect('/');
        return;
    }

    product.getFilteredProductsIDs(categoryId, function (err, result) {
        if (err) console.log(err);
        else {
            filtered = result;
            var successMsg = req.flash('success')[0];
            var productChunks = [];
            var docs2 = [];
            var chunkSize = 3;

            for (var i = 0; i < docs.length; i++) {
                for (var j = 0; j < filtered.length; j++) {
                    if (filtered[j].productID == docs[i].ID) {
                        docs2.push(docs[i]);
                    }
                }
            }

            for (var i = 0; i < docs2.length; i += chunkSize) {
                productChunks.push(docs2.slice(i, i + chunkSize));
            }
            res.render('shop/index', { categoryInfo: categoryInfo, products: productChunks, categories: categories, successMsg: successMsg, noMessages: !successMsg });
        }
    }, req);
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/signup');
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/signup');
}

module.exports = router;
