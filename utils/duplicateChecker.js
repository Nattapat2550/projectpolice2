const crypto = require('crypto');
const pool = require('../config/db'); // ลบ .js ออกและดึงจาก CommonJS config

// text to hash
exports.generateHash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

//search hash in db
exports.isDuplicate = async (hash) => {
  const { rows } = await pool.query(
    'SELECT id FROM documents WHERE content_hash = $1',
    [hash]
  );
  return rows.length > 0 ? rows[0] : null;
};