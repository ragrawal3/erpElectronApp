// Middleware to set the firm database connection pool based on the session
const masterPools = require('../db/masterDbManager');

function getMasterDbPool(req, res, next) {
  try {
    req.masterDbPool = masterPools;
    next();
  } catch (err) {
    console.error('Master DB connection error:', err);
    return res.status(500).json({ message: 'Failed to connect to master database' });
  }
}

module.exports = getMasterDbPool ;
