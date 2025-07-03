const errorCodes = require('../constants/errorCodes');

exports.createParty = async (db, data) => {
  const { name, type, phone, email, gstin, address, opening_balance } = data;
  const result = await db.query(
    `INSERT INTO parties (name, type, phone, email, gstin, address, opening_balance)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, type, phone, email, gstin, address, opening_balance]
  );
  return result.rows[0];
};

exports.getAllParties = async (db) => {
    const result = await db.query(`SELECT * FROM parties ORDER BY name`);
    return result.rows;
};

exports.getPartyById = async (db, id) => {
  const result = await db.query(`SELECT * FROM parties WHERE id = $1`, [id]);
  if (!result) throw{...errorCodes.PARTY_NOT_FOUND};
  return result.rows[0];
};

exports.updateParty = async (db, id, data) => {  
  const { name, type, phone, email, gstin, address, opening_balance } = data;
  const result = await db.query(
    `UPDATE parties SET name=$1, type=$2, phone=$3, email=$4, gstin=$5, address=$6, opening_balance=$7, last_updated_at = CURRENT_TIMESTAMP
     WHERE id = $8 RETURNING *`,
    [name, type, phone, email, gstin, address, opening_balance, id]
  );

  if (!result) throw {...errorCodes.PARTY_NOT_FOUND};
  return result.rows[0];
};

exports.deleteParty = async (db, id) => {
  const result = await db.query(`DELETE FROM parties WHERE id = $1 RETURNING *`, [id]);
  if (!result) throw{...errorCodes.PARTY_NOT_FOUND};
  return result.rows[0];
};
