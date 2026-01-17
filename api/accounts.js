import { getDb, initDb } from './_db.js';
import { authenticator } from 'otplib';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initDb();
        const db = getDb();

        // GET - List all accounts
        if (req.method === 'GET') {
            const result = await db.execute('SELECT id, email, secret, note, created_at FROM accounts ORDER BY created_at DESC');
            return res.status(200).json(result.rows);
        }

        // POST - Add account
        if (req.method === 'POST') {
            const { email, secret, note } = req.body;

            if (!email || !secret) {
                return res.status(400).json({ error: 'Email và Secret là bắt buộc' });
            }

            try {
                authenticator.generate(secret.replace(/\s/g, ''));
            } catch (e) {
                return res.status(400).json({ error: 'Secret key không hợp lệ' });
            }

            try {
                const result = await db.execute({
                    sql: 'INSERT INTO accounts (email, secret, note) VALUES (?, ?, ?)',
                    args: [email.toLowerCase().trim(), secret.replace(/\s/g, ''), note || '']
                });
                return res.status(200).json({ id: Number(result.lastInsertRowid), message: 'Thêm tài khoản thành công' });
            } catch (error) {
                if (error.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email đã tồn tại' });
                }
                throw error;
            }
        }

        // PUT - Update account
        if (req.method === 'PUT') {
            const { id, email, secret, note } = req.body;

            if (!id || !email || !secret) {
                return res.status(400).json({ error: 'ID, Email và Secret là bắt buộc' });
            }

            try {
                authenticator.generate(secret.replace(/\s/g, ''));
            } catch (e) {
                return res.status(400).json({ error: 'Secret key không hợp lệ' });
            }

            await db.execute({
                sql: 'UPDATE accounts SET email = ?, secret = ?, note = ? WHERE id = ?',
                args: [email.toLowerCase().trim(), secret.replace(/\s/g, ''), note || '', id]
            });
            return res.status(200).json({ message: 'Cập nhật thành công' });
        }

        // DELETE - Delete account
        if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID là bắt buộc' });
            }

            await db.execute({
                sql: 'DELETE FROM accounts WHERE id = ?',
                args: [id]
            });
            return res.status(200).json({ message: 'Xóa thành công' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
