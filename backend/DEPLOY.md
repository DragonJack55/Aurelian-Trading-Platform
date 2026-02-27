# FAST Deployment Guide - Namecheap Backend

## Step 1: Upload Backend Files (3 minutes)

1. **Go to cPanel** → **File Manager**
2. **Navigate to**: `/home/aureywqd/` (or your home directory)
3. **Create folder**: `backend`
4. **Go into the backend folder**
5. **Upload** the file: `/Users/jack/Documents/Aurelian TD Trade/backend/backend-deploy.tar.gz`
6. **Right-click** the uploaded file → **Extract**
7. **Delete** the .tar.gz file after extraction

## Step 2: Create .env File (1 minute)

1. **In File Manager**, click **+ File** button
2. **Name**: `.env`
3. **Right-click** `.env` → **Edit**
4. **Paste this**:

```env
DB_HOST=localhost
DB_USER=aureywqd_aurelian_user
DB_PASSWORD=nkundakigali
DB_NAME=aureywqd_aurelian_trade
DB_PORT=3306
JWT_SECRET=aurelian_trade_secret_key_2026_change_this_xyz789
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://aureliantdtrade.it.com
```

1. **Save**

## Step 3: Set Up Node.js App (3 minutes)

1. **In cPanel**, search for **"Setup Node.js App"**
2. **Click** "Setup Node.js App"
3. **Create Application**:
   - Node.js version: **18.x** (or latest available)
   - Application mode: **Production**
   - Application root: `/home/aureywqd/backend`
   - Application URL: Leave blank or use subdomain
   - Application startup file: `server.js`
4. **Click** "Create"

## Step 4: Install Dependencies (2 minutes)

1. **After app is created**, you'll see a command like:

   ```
   source /home/aureywqd/nodevenv/backend/18/bin/activate
   ```

2. **Click** "Run NPM Install" button
   - OR open **Terminal** in cPanel and run:

   ```bash
   cd /home/aureywqd/backend
   npm install
   ```

## Step 5: Start the App (1 minute)

1. **In the Node.js App interface**, click **"Start"** button
2. **App should show** "Running" status

## Step 6: Test It Works

**Open Terminal** in cPanel and run:

```bash
curl http://localhost:3001/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

---

## Total Time: ~10 minutes

**After this works, I'll update the frontend to use the new API!**

## Troubleshooting

- **"npm install failed"**: Click "Run NPM Install" again
- **"App won't start"**: Check error logs in Node.js App interface
- **"Port already in use"**: Change PORT in .env to 3002

**Let me know when you reach each step!**
