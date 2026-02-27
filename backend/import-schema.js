import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSchema() {
    let connection;

    try {
        console.log('🔌 Connecting to Railway MySQL database...');

        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT) || 3306,
            multipleStatements: true
        });

        console.log('✅ Connected to database successfully!');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Generate proper bcrypt hash for admin password
        console.log('🔐 Generating admin password hash...');
        const adminPasswordHash = await bcrypt.hash('nkundakigali', 10);

        // Replace placeholder with actual hash
        schema = schema.replace('$2a$10$placeholder_will_be_generated', adminPasswordHash);

        console.log('📥 Importing database schema...');

        // Execute schema
        await connection.query(schema);

        console.log('✅ Database schema imported successfully!');

        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\n📊 Created tables:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });

        // Check if admin user exists
        const [adminRows] = await connection.query(
            'SELECT email, full_name, points FROM users WHERE email = ?',
            ['admin@aureliantrade.com']
        );

        if (adminRows.length > 0) {
            console.log('\n👤 Admin user created:');
            console.log(`  Email: ${adminRows[0].email}`);
            console.log(`  Name: ${adminRows[0].full_name}`);
            console.log(`  Points: ${adminRows[0].points}`);
            console.log(`  Password: nkundakigali`);
        }

        console.log('\n🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Error importing schema:', error.message);
        if (error.code) {
            console.error(`   Error code: ${error.code}`);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the import
importSchema();
