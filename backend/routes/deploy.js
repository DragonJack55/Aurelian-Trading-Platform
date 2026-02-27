import express from 'express';
import { exec } from 'child_process';
import path from 'path';

const router = express.Router();

// Configuration
// In production, this should match the secret in GitHub Webhooks
const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'aurelian_deploy_secret_2025';

router.post('/', (req, res) => {
    const { secret } = req.query;

    // 1. Security Check
    // We check query param ?secret=... or headers if configured. 
    // Simple query param is easiest for this setup.
    if (secret !== DEPLOY_SECRET) {
        console.warn('Unauthorized deploy attempt.');
        return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('🚀 Deployment trigger received. Starting update...');

    // 2. Execute Deployment Commands
    // Pull changes from master
    exec('git pull origin master', { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Git Pull Error: ${error.message}`);
            return res.status(500).json({ success: false, error: 'Git pull failed', details: error.message });
        }

        console.log(`Git Output: ${stdout}`);

        // 3. Restart Application (Passenger)
        // cPanel Passenger apps restart when tmp/restart.txt is touched
        exec('mkdir -p tmp && touch tmp/restart.txt', { cwd: path.resolve(__dirname, '..') }, (err, out, serr) => {
            if (err) {
                console.error(`Restart Error: ${err.message}`);
                // Verify pull succeeded though
                return res.json({ success: true, message: 'Git pulled, but restart trigger failed.', output: stdout });
            }

            console.log('✅ Restart triggered successfully.');
            res.json({
                success: true,
                message: 'Deployment successful. Application restarting...',
                output: stdout
            });
        });
    });
});

export default router;
