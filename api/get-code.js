const { getDb, initDb } = require('./_db.js');
const { authenticator } = require('otplib');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await initDb();
        const db = getDb();

        const { email } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM accounts WHERE email = ?',
            args: [email.toLowerCase().trim()]
        });

        if (result.rows.length === 0) {
            await db.execute({
                sql: 'INSERT INTO logs (email, ip, success) VALUES (?, ?, 0)',
                args: [email, ip]
            });
            return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
        }

        const account = result.rows[0];

        try {
            const code = authenticator.generate(account.secret);
            const timeRemaining = 30 - Math.floor((Date.now() / 1000) % 30);

            await db.execute({
                sql: 'INSERT INTO logs (email, ip, success) VALUES (?, ?, 1)',
                args: [email, ip]
            });

            return res.status(200).json({
                code,
                timeRemaining,
                email: account.email
            });
        } catch (error) {
            return res.status(500).json({ error: 'Không thể tạo mã 2FA. Secret key không hợp lệ.' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
