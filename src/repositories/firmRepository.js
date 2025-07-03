const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const { getFirmPool } = require('../db/firmDbManager');


exports.createNewFirm = async (db, data, userId, db_name) => {
  try {
    // ToDo Remove comment when done with testing phase, to create new databse every time.
    // Create a new DB
    // await createFirmDatabase(db_name);    

    await db.query('BEGIN');

    const firmResult = await db.query(`INSERT INTO firms (name, address, contact_email, contact_phone, logo_url, gst, state, created_by, db_name )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`, [data.name, data.address, data.contact_email, data.contact_phone, data.logo_url, data.gst, data.state, userId, db_name]);
    
    // Apply schema to new DB
    await applySchemaToFirmDb(db_name);
    
    // Insert into user_firm_roles (as admin)
    await db.query(
    `INSERT INTO user_firm_roles (user_id, firm_id, role)
    VALUES ($1, $2, $3)`,
    [userId, firmResult.rows[0].id, 'admin']
    );

    await db.query('COMMIT'); 
    return firmResult;
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    await db.release();
  }
}

exports.getUserRoleForFirm = (db, userId, firmId) => {
  return db.query('SELECT role FROM user_firm_roles WHERE user_id = $1 AND firm_id = $2', [userId, firmId]); 
}

exports.getFirmDetails = (db, firmId) => {
  return db.query(`SELECT * FROM firms WHERE id = $1`, [firmId]);
}

async function createFirmDatabase(db_Name) {
  // Connection to main server (not a specific DB)
  const serverPool = new Pool({
    host: process.env.MASTER_DB_HOST,
    port: process.env.MASTER_DB_PORT,
    user: process.env.Master_DB_USER,
    password: process.env.Master_DB_PASSWORD,
    database: 'postgres', // connect to default postgres DB to run CREATE DATABASE
  });
  try {
    await serverPool.query(`CREATE DATABASE "${db_Name}"`);
  } catch (err) {
    throw err;
  } finally {
    await serverPool.end();
  }
}


async function applySchemaToFirmDb(db_name) {
  const schemaPath = path.join(__dirname, '../sql/firm_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  const firmPool = getFirmPool(db_name);
  
  try {
    await firmPool.query(schemaSQL);
  } catch (err) {
    throw err;
  } finally {
    await firmPool.end();
  }
}