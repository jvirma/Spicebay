var mysql = require('mysql');
const connections = require('../config/connectionChooser');
const uuidv4 = require('uuid/v4');

function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join(" / ");
}



module.exports = function order() {

    this.savePayment = function (data, callback, req) {
        var insertQuery = "INSERT INTO Payment (ID, paymentType, paid, amount) VALUES (?, ?, ?, ?)";
        const connection = connections.area2connection(req.session.userArea);
        connection.query(insertQuery, [data.paymentID, 'Debit card', 1, data.cart.totalPrice],
            function (err, results, fields) {
                if (err)
                    return callback(err);
                else
                    callback(null, "success");
            }
        );
    }
    this.saveShopOrder = function (data, callback, req) {
        const connection = connections.area2connection(req.session.userArea);
        var insertQuery = "INSERT INTO ShopOrder (ID, customerID, paymentID) VALUES (?, ?, ?)";
        connection.query(insertQuery, [data.shopOrderID, data.customer, data.paymentID],
            function (err, results, fields) {
                if (err)
                    return callback(err);
                else
                    callback(null, "success");
            }
        );
    }
    this.saveOrderContains = function (data, callback, req) {
        const connection = connections.area2connection(req.session.userArea);
        var products = data.cart.generateArray();
        var arr = [];
        for (id in products) {
            arr.push(
                [products[id].item.ID, data.shopOrderID, products[id].qty]
            );
        }
        console.log(arr);

            var insertQuery = "INSERT INTO OrderContains (productID, orderID, amount) VALUES ?";
            connection.query(insertQuery, [arr],
                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    } else {
                        callback(null, "success");
                    }

                }
            );
        
        
    }
    

    this.getOrders = function (data, callback, req) {
        const connection = connections.area2connection(data.session.userArea);
        connection.query("SELECT ShopOrder.ID, ShopOrder.customerID, ShopOrder.createdAt, ShopOrder.paymentID, Payment.amount FROM ShopOrder INNER JOIN Payment ON ShopOrder.paymentID=Payment.ID WHERE customerID=(?)", [data.user.ID],
            function (err, results, fields) {
                if (err)
                    return callback(err);
                else {
                    for (i in results) {
                        results[i].createdAt = convert(results[i].createdAt);
                    }
                      

                    callback(null, results);
                }
            }
        );
    }

    this.getOrdersProducts = function (callback, req) {

            const connection = connections.area2connection(req.session.userArea);
            connection.query("SELECT OrderContains.orderID, Product.cost, Product.productName, OrderContains.amount FROM OrderContains INNER JOIN Product ON OrderContains.productID=Product.ID",
                function (err, results, fields) {
                    if (err) {
                        console.log(err)
                        return callback(err);
                    }
                    else {
                        //console.log(results);
                        callback(null, results);
                    }
                }
            );

     }
        
}
