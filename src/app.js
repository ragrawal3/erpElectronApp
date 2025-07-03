// const cors = require('cors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pgSession = require('connect-pg-simple')(session);
const masterPools = require('./db/masterDbManager');


const errorHandler = require('./middleware/errorHandler');

const sessionRoutes = require('./routes/sessionRoutes');
const firmRoutes = require('./routes/firmRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const productRoutes = require('./routes/productRoutes');
const productVariantRoutes = require('./routes/productVariantRoutes');
const unitRoutes = require('./routes/unitRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const partyRoutes = require('./routes/partyRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const partyTransactionsRoutes = require('./routes/partyTransactionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const draftInvoiceRoutes = require('./routes/draftInvoiceRoutes');


require('dotenv').config(); // Load environment variables from .env file
const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(cookieParser()); // Parse cookies

// Session Setup
app.use(session({
  store: new pgSession({
    pool: masterPools,
    tableName: 'session',
    createTableIfMissing: true,
    logError: true
  }),
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // cookie lifeSpan 1 day
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax' // or 'nobe' if you're using HTTPS and cross-domain
  }
}));

// ToDo for local or test apps
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads directory
// http://localhost:5000/uploads/products/<image_name>


// Dev:check for loggedinUser
app.get('/api', (req, res) => {
  res.send({loggedInUser: req.session.user});
});
// Dev: check if single session is created any individual client.
// if session persisit, views will increate with every hit, else new session will be crated each time with views=1 always.
app.get('/api/test-session', (req, res) => {
  if (req.session.views) { req.session.views++;
  } else { req.session.views = 1;
  }
  res.json({
    sid: req.sessionID,
    views: req.session.views
  });
});


app.use('/api/sessionRoutes', sessionRoutes);
app.use('/api/firmRoutes', firmRoutes);
app.use('/api/userRoutes', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/product', productRoutes);
app.use('/api/productVariant', productVariantRoutes);
app.use('/api/unit', unitRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/party/', partyRoutes);
app.use('/api/transaction/', transactionRoutes);
app.use('/api/partyTransactions/', partyTransactionsRoutes);
app.use('/api/invoice/', invoiceRoutes);
app.use('/api/draftInvoice/', draftInvoiceRoutes);

// middleware to handle errors
app.use(errorHandler);

module.exports = app;
