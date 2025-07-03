// Middleware to set the firm database connection pool based on the session
const getFirmPool = require('../db/firmDbManager');

function attachFirmDb(req, res, next) {
  const dbName = req.session?.firm.dbName;

  if (!dbName) {
    return res.status(400).json({ message: 'Firm not selected' });
  }
  try {
    req.firmDbPool = getFirmPool(dbName);
    next();
  } catch (err) {
    console.error('Firm DB connection error:', err);
    return res.status(500).json({ message: 'Failed to connect to firm database' });
  }
}

module.exports =  attachFirmDb ;
