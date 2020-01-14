const mysql = require('mysql');
const util = require('util');

const pools = {
    indiaPool: mysql.createPool({
        'connectionLimit': '100',
        'host': 'remotemysql.com',
        'user': 'g39SwdPcnM',
        'password': 'xNaEORgN4K',
        'port': '3306',
        'database': 'g39SwdPcnM'
    }),
    finlandPool: mysql.createPool({
        'connectionLimit': '100',
        'host': 'remotemysql.com',
        'user': 'uLBpw9SDFr',
        'password': 'iD3ugTBgzd',
        'port': '3306',
        'database': 'uLBpw9SDFr'
    }),
    canadaPool: mysql.createPool({
        'connectionLimit': '100',
        'host': 'remotemysql.com',
        'user': 'S8pKNec4ub',
        'password': 'YGrNazYG53',
        'port': '3306',
        'database': 'S8pKNec4ub'
    })
};

const callback = (err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return;
}

for (pool in pools) {
    pools[pool].getConnection(callback);
    // Promisify for Node.js async/await.
    pools[pool].query = util.promisify(pools[pool].query);
}

module.exports = pools;
