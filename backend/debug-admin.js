import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.railway' });

async function checkAdmin() {
    let connection;
    try {
        console.log('🔌 Connecting to Railway MySQL...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT)
        });

        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@aureliantrade.com']);

        if (rows.length === 0) {
            console.log('❌ Admin user not found!');
        } else {
            console.log('✅ Admin user found');
            const user = rows[0];
            console.log('Stored Hash:', user.password_hash);

            const isMatch = await bcrypt.compare('nkundakigali', user.password_hash);
            console.log('Password "nkundakigali" match:', isMatch);

            if (!isMatch) {
                console.log('⚠️ Password mismatch. Fixing it now...');
                const newHash = await bcrypt.hash('nkundakigali', 10);
                await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
                console.log('✅ Admin password updated to "nkundakigali"');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkAdmin();
