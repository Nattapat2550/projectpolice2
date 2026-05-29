const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB,
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("Connection error", err));

module.exports = pool;