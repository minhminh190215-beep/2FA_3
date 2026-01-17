import { getDb, initDb } from './_db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initDb();
        const db = getDb();

        // GET - List all logs
        if (req.method === 'GET') {
            const result = await db.execute('SELECT * FROM logs ORDER BY accessed_at DESC LIMIT 500');
            return res.status(200).json(result.rows);
        }

        // DELETE - Clear all logs
        if (req.method === 'DELETE') {
            await db.execute('DELETE FROM logs');
            return res.status(200).json({ message: 'Đã xóa tất cả log' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
