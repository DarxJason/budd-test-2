// /api/login.js (Serverless Function)
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { loginCode } = req.body; // Expect the login code from the request
    const query = 'SELECT * FROM players WHERE login_code = $1';

    try {
      const result = await pool.query(query, [loginCode]);
      if (result.rows.length > 0) {
        res.status(200).json({ player: result.rows[0] });
      } else {
        res.status(404).json({ error: 'Player not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};

