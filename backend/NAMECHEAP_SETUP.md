# Namecheap MySQL Database Setup Guide

## Step 1: Create MySQL Database via cPanel

1. **Go to Namecheap Dashboard**:
   - Click "GO TO CPANEL" button for `aureliantdtrade.it.com`

2. **Find MySQL Databases** in cPanel:
   - Scroll down to "DATABASES" section
   - Click "MySQL Databases"

3. **Create New Database**:
   - Database Name: `aurelian_trade`
   - Click "Create Database"

4. **Create MySQL User**:
   - Username: `aurelian_user`
   - Password: (generate strong password or use: `AurelianTrade2026!`)
   - Click "Create User"

5. **Add User to Database**:
   - Select user: `aurelian_user`
   - Select database: `aurelian_trade`
   - Grant ALL PRIVILEGES
   - Click "Add"

6. **Note Your Credentials**:

   ```
   DB_HOST: localhost (or check cPanel for exact hostname)
   DB_USER: [cpanel_username]_aurelian_user
   DB_PASSWORD: [your_password]
   DB_NAME: [cpanel_username]_aurelian_trade
   DB_PORT: 3306
   ```

## Step 2: Import Database Schema

1. **Go to phpMyAdmin** in cPanel:
   - Find it under "DATABASES" section
   - Click "phpMyAdmin"

2. **Select Your Database**:
   - Click on `aurelian_trade` in the left sidebar

3. **Import Schema**:
   - Click "SQL" tab at the top
   - Copy the entire contents of `/backend/schema.sql`
   - Paste into the SQL query box
   - Click "Go"

4. **Verify Tables Created**:
   - You should see 7 tables:
     - users
     - trades
     - messages
     - deposits
     - withdrawals
     - verifications
     - otp_codes

## Step 3: Create Admin User

1. **Still in phpMyAdmin**:
   - Click on `users` table
   - Click "Insert" tab

2. **Add Admin User**:
   - email: `admin@aureliantrade.com`
   - password_hash: (we'll generate this)
   - full_name: `Admin`
   - points: `999999999.99`
   - status: `approved`
   - verification_status: `verified`
   - Leave other fields as defaults
   - Click "Go"

## Step 4: Generate Password Hash for Admin

Run this locally to generate the hash for 'nkundakigali':

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('nkundakigali', 10).then(hash => console.log(hash));"
```

Copy the output hash and update the admin user's `password_hash` in phpMyAdmin.

## Step 5: Configure Backend .env

Create `/backend/.env` with your Namecheap credentials:

```env
DB_HOST=localhost
DB_USER=[cpanel_username]_aurelian_user
DB_PASSWORD=[your_password]
DB_NAME=[cpanel_username]_aurelian_trade
DB_PORT=3306

JWT_SECRET=super_secret_change_this_in_production_xyz123

PORT=3001
NODE_ENV=production

FRONTEND_URL=https://aureliantdtrade.it.com
```

## Step 6: Test Connection Locally

```bash
cd backend
npm start
```

If you see "✓ MySQL Database connected successfully", you're good!

## Next Steps

Once database is set up:

1. Deploy backend to Namecheap cPanel
2. Update frontend to use new API endpoints
3. Migrate existing Firebase data
