const errorCodes = require('../constants/errorCodes');

exports.createTransaction = async (db, data) => {
  const {
    party_id,
    amount,
    type,     // 'payment' or 'receipt'
    mode,                 // e.g., 'cash', 'bank', 'upi'
    note,                  // optional text
    invoice_id
  } = data;

  if (!party_id || !amount || !type) {
    throw {...errorCodes.MISSING_REQUIRED_FIELDS};
  }

  const query = `
    INSERT INTO party_transactions (
      party_id,
      amount,
      type,
      mode,
      note,
      invoice_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [party_id, amount, type, mode, note, invoice_id];

  const result = await db.query(query, values);
  return result.rows[0];
};

exports.getAllTransactions = async (db) => {
  const query = `
    SELECT *
    FROM party_transactions
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

exports.getTransactionsByParty = async (db, party_id) => {
  const query = `
    SELECT *
    FROM party_transactions
    WHERE party_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query, [party_id]);
  if (!result.rows) throw {...errorCodes.TRANSACTION_NOT_FOUND};
  return result.rows;
};

exports.getTransactionById = async (db, id) => {
  const query = `
    SELECT *
    FROM party_transactions
    WHERE id = $1
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query, [id]);
  if (!result.rows) throw {...errorCodes.TRANSACTION_NOT_FOUND};
  return result.rows;
};

exports.deleteTransaction = async (db, id) => {
  const query = `
    DELETE FROM party_transactions
    WHERE id = $1
    RETURNING *;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

exports.updateTransaction = async (db, id, data) => {
  const {
    amount,
    type,
    mode,
    note,
  } = data;

  const query = `
    UPDATE party_transactions
    SET amount = $1,
        type = $2,
        mode = $3,
        note = $4
    WHERE id = $5
    RETURNING *;
  `;

  const values = [amount, type, mode, note, id];
  const result = await db.query(query, values);
  return result.rows[0];
};
