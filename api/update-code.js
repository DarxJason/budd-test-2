export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { oldLoginCode, newLoginCode } = req.body;

        if (!oldLoginCode || !newLoginCode) {
            return res.status(400).json({ error: 'Both old and new login codes are required' });
        }

        try {
            // Update the login code in the users table
            const result = await pool.query(
                'UPDATE users SET login_code = $1 WHERE login_code = $2 RETURNING *',
                [newLoginCode, oldLoginCode]
            );

            if (result.rowCount > 0) {
                res.status(200).json({ message: 'Login code updated successfully!' });
            } else {
                res.status(401).json({ error: 'Invalid old login code' });
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
