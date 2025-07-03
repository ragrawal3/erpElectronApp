const { Pool } = require('pg');
const firmPools = {};

function getFirmPool(dbName) {
  if (!firmPools[dbName]) {
    firmPools[dbName] = new Pool({
      host: process.env.FIRM_DB_HOST,
      port: process.env.FIRM_DB_PORT,
      user: "postgres",
      password: "admin123",
      database: dbName
    });
  }
  return firmPools[dbName];
}

module.exports =  getFirmPool ;
