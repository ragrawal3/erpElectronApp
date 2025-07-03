exports.getPartyTransactions =  async (db, filters = {}) => {
    const { party_id, type, mode, date_from, date_to } = filters;
    const values = [];
    const conditions = [];

    if (party_id) {
        values.push(party_id);
        conditions.push(`party_id = $${values.length}`);
    }
    if (type) {
        values.push(type);
        conditions.push(`type = $${values.length}`);
    }
    if (mode) {
        values.push(mode);
        conditions.push(`mode = $${values.length}`);
    }
    if (date_from) {
        values.push(date_from);
        conditions.push(`created_at >= $${values.length}`);
    }
    if (date_to) {
        values.push(date_to);
        conditions.push(`created_at <= $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM party_transactions ${whereClause} ORDER BY created_at DESC;`;
    
    const result = await db.query(query, values);
    return result.rows;
};

//NotUsed anywhere
exports.updatePartyTransactions =  async (db, id, updates) => {
    const fields = [];
    const values = [];
    let idx = 1;
    
    for (const key in updates) {
        fields.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx++;
    }

    values.push(id);

    const query = `Update party_transactions SET ${fields.join(', ')} 
                    WHERE id = $${idx} RETURNING *;`;
    
    const result = await db.query(query, values);
    return result.rows;
};