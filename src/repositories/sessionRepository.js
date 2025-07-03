exports.getActiveSessions = (db) => {
    return db.query(` SELECT sid, sess, expire FROM session where expire > NOW();`);
}


exports.deleteSession = (db, sessionId) => {
    return db.query(`DELETE FROM session WHERE sid = $1 RETURNING *`, [ sessionId ]);
}