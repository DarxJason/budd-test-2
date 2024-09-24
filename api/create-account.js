// api/create-account.js
import { Pool } from 'pg';

// Initialize the PostgreSQL client
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL, // Use the environment variable
});

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'POST') {
        try {
            const loginCode = generateLoginCode(); // Function to generate a random login code
            
            // Insert into the database
            await pool.query('INSERT INTO users (login_code) VALUES ($1)', [loginCode]);

            res.status(200).json({ loginCode });
        } catch (error) {
            console.error('Error creating account:', error); // Log the error for debugging
            res.status(500).json({ error: 'Failed to create account: ' + error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

function generateLoginCode() {
    return Math.random().toString(36).substring(2, 12); // Generates a random 10-character string
}
