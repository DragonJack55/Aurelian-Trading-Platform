import db, { testConnection } from './config/database.js';

console.log('Testing database connection...\n');

const test = async () => {
    try {
        // Test connection
        const connected = await testConnection();

        if (!connected) {
            console.error('❌ Connection failed. Check your .env file.');
            process.exit(1);
        }

        // Test query
        const [rows] = await db.query('SHOW TABLES');
        console.log('\n✓ Tables in database:');
        rows.forEach(row => {
            console.log('  -', Object.values(row)[0]);
        });

        // Check admin user
        const [users] = await db.query('SELECT email, full_name, points FROM users WHERE email = ?', ['admin@aureliantrade.com']);

        if (users.length > 0) {
            console.log('\n✓ Admin user found:');
            console.log('  Email:', users[0].email);
            console.log('  Name:', users[0].full_name);
            console.log('  Balance:', users[0].points);
        } else {
            console.log('\n⚠ Admin user not found. Run QUICK_IMPORT.sql in phpMyAdmin.');
        }

        console.log('\n✅ Database test successful!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
};

test();
