exports.getAllUnits = async (db) => {
    const result = await db.query('SELECT * FROM units ORDER By id');
    return result.rows;
};

exports.createUnit = async (db, data) => {
    const { name, abbreviation } = data;
    const result = await db.query(
        'INSERT INTO units (name, abbreviation) VALUES ($1, $2) RETURNING *',
        [name, abbreviation]
    );
    return result.rows[0];
}

exports.updateUnit = async (db, id, data) => {
    const { name, abbreviation } = data;
    const result = await db.query(
        'UPDATE units SET name = $1, abbreviation = $2 WHERE id = $3 RETURNING *',
        [name, abbreviation, id]
    );
    return result.rows[0];
}

exports.deleteUnit = async (db, id) => {
    const result = await db.query(
        'DELETE FROM units WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
}