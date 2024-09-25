const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { loginCode } = req.body;

        if (!loginCode) {
            return res.status(400).json({ error: 'Login code is required' });
        }

        try {
            // Ensure you are querying the "users" table in your database
            const result = await pool.query('SELECT * FROM users WHERE login_code = $1', [loginCode]);

            if (result.rows.length > 0) {
                // If the login code matches, return the player details
                res.status(200).json({ player: result.rows[0] });
            } else {
                // If no matching code is found, return a failure response
                res.status(401).json({ error: 'Invalid login code' });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
