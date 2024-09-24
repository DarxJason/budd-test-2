// /api/update-movements.js (Serverless Function)
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { loginCode, movements } = req.body; // Expect loginCode and movements array from the request

    const query = 'UPDATE players SET movements = $1 WHERE login_code = $2 RETURNING *';
    
    try {
      const result = await pool.query(query, [JSON.stringify(movements), loginCode]); // Store movements as a JSON string
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'Movements updated successfully' });
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
