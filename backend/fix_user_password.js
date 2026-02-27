import db from './config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL = 'verify_test_jet_012@temp.com';
const NEW_PASSWORD = 'password123';

const fixPassword = async () => {
    try {
        console.log(`Checking user: ${EMAIL}`);
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [EMAIL]);

        if (users.length === 0) {
            console.error('User not found!');
            process.exit(1);
        }

        console.log('User found. Resetting password...');
        const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

        await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, EMAIL]);

        console.log(`SUCCESS: Password for ${EMAIL} reset to: ${NEW_PASSWORD}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixPassword();
