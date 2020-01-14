var mysql = require('mysql');
var connections = require('../config/connectionChooser');

module.exports = function customer() {
    this.updateInformation = function (req, callback) {
        var updateQuery = "UPDATE Customer SET firstName = (?), lastName = (?), email = (?)  WHERE ID = ?";
        const connection = connections.area2connection('India');
        connection.query(updateQuery, [req.body.firstName, req.body.lastName, req.body.email, req.user.ID],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                callback(null, "success")
            }
        );
    };
    this.deleteAccount = function (req, callback) {
        var deleteQuery = "DELETE FROM Customer WHERE ID=?";
        const connection = connections.area2connection('India');
        connection.query(deleteQuery, [req.customer.customerID],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                callback(null, "success")
            }
        );
    };
}
