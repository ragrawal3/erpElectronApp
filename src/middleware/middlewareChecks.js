const errorCodes = require('../constants/errorCodes')

// Middleware: check if logged in
function requireLogin(req, res, next) {
  // if (!req.session.user) {
  //   return res.status(401).json({ message: 'You must be logged in' });
  // }
  req.session.user = {
    id: 1,
    username: 'Rishabh'
  };
  next();
}

// Middleware: set firm DB connection
function requireFirm(req, res, next) {
  // if (!req.session.firmDbName) {
  //   return res.status(400).json({ message: 'Firm not selected' });
  // }

  req.session.firm = {
    id: 30,
    dbName: 'firm_appreals',
    role: 'admin'
  };
  //req.session.firmDbName = 'firm_appreals';
  next();
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    console.log(req.session.firm?.role);
    if (req.session.firm?.role !== requiredRole) {
      throw {...errorCodes.UNAUTHORIZED};
    }
    next();
  };
}

module.exports = { requireLogin, requireFirm, requireRole };