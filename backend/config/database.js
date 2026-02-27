import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
export const testConnection = async () => {
    // Mock DB for local testing of static files without DB requirement
    if (process.env.MOCK_DB === 'true') {
        console.warn('⚠️  RUNNING IN MOCK DB MODE: Database connection skipped.');
        return true;
    }

    try {
        const connection = await pool.getConnection();
        console.log('✓ MySQL Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error);
        return false;
    }
};

export default pool;
