
exports.authenticateUser = (db, userName, password) => {
  return db.query('SELECT id, name FROM users WHERE name = $1 AND password_hash = $2;', [userName, password]);
}

exports.getFirmsForUser = (db, userId) => {
    return db.query(`
      SELECT f.id, f.name
      FROM firms f
        JOIN user_firm_roles ufr ON ufr.firm_id = f.id
      WHERE ufr.user_id = $1
      ORDER BY f.name;`
          , [userId]);
}