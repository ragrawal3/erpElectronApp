const { Pool } = require('pg');

const masterPools = new Pool({
    host: process.env.Master_DB_HOST,
    port: process.env.Master_DB_PORT,
    user: "postgres",
    password: "admin123",
    database: "erp_master_db",
  });

module.exports =  masterPools ;
