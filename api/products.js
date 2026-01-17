import { getDb, initDb } from './_db.js';

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

        // GET - List all products
        if (req.method === 'GET') {
            const result = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
            return res.status(200).json(result.rows);
        }

        // POST - Add product
        if (req.method === 'POST') {
            const { name, price } = req.body;

            if (!name || !price) {
                return res.status(400).json({ error: 'Tên và giá là bắt buộc' });
            }

            const result = await db.execute({
                sql: 'INSERT INTO products (name, price) VALUES (?, ?)',
                args: [name, price]
            });
            return res.status(200).json({ id: Number(result.lastInsertRowid), message: 'Thêm sản phẩm thành công' });
        }

        // PUT - Update product
        if (req.method === 'PUT') {
            const { id, name, price } = req.body;

            if (!id || !name || !price) {
                return res.status(400).json({ error: 'ID, Tên và Giá là bắt buộc' });
            }

            await db.execute({
                sql: 'UPDATE products SET name = ?, price = ? WHERE id = ?',
                args: [name, price, id]
            });
            return res.status(200).json({ message: 'Cập nhật thành công' });
        }

        // DELETE - Delete product
        if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID là bắt buộc' });
            }

            await db.execute({
                sql: 'DELETE FROM products WHERE id = ?',
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
