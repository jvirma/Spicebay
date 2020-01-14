var mysql = require('mysql');
const connections = require('../config/connectionChooser');

module.exports = function product() {
    this.getCategories = function (callback) {
        const connection = connections.getDefaultConnection();
        connection.query("SELECT * FROM CategoryTag",
            function (err, results, fields) {
                if (err)
                    return callback(err);
                callback(null, results)
            }
        );
    };


    this.getProducts = function (callback) {
        const connection = connections.getDefaultConnection();
        connection.query("SELECT * FROM Product",
            function (err, results, fields) {
                if (err)
                    return callback(err);
                callback(null, results)
            }
        );
    };

    this.getProductAmounts = function (region, callback) {
        const connection = connections.area2connection(region);
        connection.query("SELECT P.ID, WC.amount FROM Product P JOIN WarehouseContains WC ON WC.productID = P.ID ORDER BY P.ID",
            function (err, results, fields) {
                if (err)
                    return callback(err);
                //console.log(results);
                callback(null, results)
            }
        );
    };

    this.getFilteredProductsIDs = function (id, callback, req) {
        const connection = connections.area2connection(req.session.userArea);
        connection.query("SELECT * FROM ProductHas WHERE categoryID = ?", [id],
            function (err, results, fields) {
                if (err)
                    return callback(err);
                callback(null, results)
            }
        );
    };
}
