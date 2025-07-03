exports.getAllCategories = async (db) => {
    const result = await db.query('SELECT * FROM categories ORDER By id');
    return result.rows;
};

exports.createCategory = async (db, data) => {
    const { name, description } = data;
    const result = await db.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
    );
    return result.rows[0];
}

exports.updateCategory = async (db, id, data) => {
    const { name, description } = data;
    const result = await db.query(
        'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
    );
    return result.rows[0];
}

exports.deleteCategory = async (db, id) => {
    const result = await db.query(
        'DELETE FROM categories WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
}