// /api/create-account.js (Serverless Function)
const { Pool } = require('pg');

// Connect to your Postgres database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const loginCode = Math.random().toString(36).substr(2, 10); // Generate 10-digit code
    const query = 'INSERT INTO players (login_code, movements, created_at) VALUES ($1, $2, NOW()) RETURNING *';

    try {
      const result = await pool.query(query, [loginCode, '[]']); // Save an empty movements array initially
      res.status(200).json({ loginCode: result.rows[0].login_code });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};

