var connections = require('./mysqlConnector');

const area2connection = area => {
  switch (area) {
    case 'Canada':
      return connections.canadaPool;

    case 'Finland':
      return connections.finlandPool;

    case 'India':
      return connections.indiaPool;

    default:
      return connections.indiaPool;
  }
};

const getDefaultConnection = () => {
  if (connections.indiaPool) {
    return connections.indiaPool;
  } else if (connections.canadaPool) {
    return connections.canadaPool;
  }
  return connections.finlandPool;
}

module.exports = { area2connection, getDefaultConnection };