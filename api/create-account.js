// api/create-account.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const loginCode = generateLoginCode(); // Your function to generate a 10-digit code
            // Optionally, save the login code in the database

            // Example query to save the login code (customize based on your DB schema)
            await pool.query('INSERT INTO users (login_code) VALUES ($1)', [loginCode]);

            res.status(200).json({ loginCode });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

function generateLoginCode() {
    return Math.random().toString(36).substring(2, 12); // Generates a random 10-character string
}
