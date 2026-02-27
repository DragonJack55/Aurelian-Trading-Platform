import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';

// Copy this configuration exactly from your authService.js to test IT specifically
const TEST_CONFIG = {
    publicKey: 'qmWEN4TqsmUUaSyN-',
    serviceId: 'service_622zonf',
    templateId: 'template_p6g5bpc'
};

const EmailDiagnostic = () => {
    const [status, setStatus] = useState('idle');
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runTest = async () => {
        setStatus('running');
        setLogs([]);
        addLog('🚀 Starting EmailJS Diagnostic...');

        try {
            // 1. Check Init
            addLog(`Checking Config: Public Key=${TEST_CONFIG.publicKey.substring(0, 5)}...`);
            emailjs.init(TEST_CONFIG.publicKey);
            addLog('✅ EmailJS Initialized');

            // 2. Prepare Data
            const params = {
                // Send multiple variations to ensure one matches
                to_email: 'hannahamandine30@gmail.com',
                email: 'hannahamandine30@gmail.com',
                recipient: 'hannahamandine30@gmail.com',
                reply_to: 'hannahamandine30@gmail.com',

                // Code variations
                otp_code: 'TEST-1234',
                otp: 'TEST-1234',
                code: 'TEST-1234',
                verification_code: 'TEST-1234',
                message: 'TEST-1234',

                to_name: 'Diagnostic User',
                expiry_time: '1 minute'
            };
            addLog(`Generated Test Params: ${JSON.stringify(params)}`);

            // 3. Send
            addLog('📨 Attempting to send email...');
            addLog(`Target Service: ${TEST_CONFIG.serviceId}`);
            addLog(`Target Template: ${TEST_CONFIG.templateId}`);

            const start = Date.now();
            const response = await emailjs.send(
                TEST_CONFIG.serviceId,
                TEST_CONFIG.templateId,
                params
            );
            const duration = Date.now() - start;

            addLog(`✅ SUCCESS! Email sent in ${duration}ms`);
            addLog(`Response Status: ${response.status}`);
            addLog(`Response Text: ${response.text}`);
            setStatus('success');

        } catch (error) {
            addLog(`❌ FAILED!`);
            addLog(`Error Name: ${error.name}`);
            addLog(`Error Message: ${error.message}`);
            if (error.text) addLog(`Error Text: ${error.text}`);

            if (error.message.includes('The user has to be permitted')) {
                addLog('💡 TIP: You might need to whitelist this domain in EmailJS dashboard.');
            }

            setStatus('error');
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
            <h1>📧 EmailJS Diagnostic Tool v5.0 (CODE FIX)</h1>
            <p>If you see this, we are sending ALL code variations.</p>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Configuration Being Tested:</h3>
                <pre>{JSON.stringify(TEST_CONFIG, null, 2)}</pre>
            </div>

            <button
                onClick={runTest}
                disabled={status === 'running'}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: status === 'running' ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {status === 'running' ? 'Running Test...' : 'Run Email Test'}
            </button>

            <div style={{ marginTop: '20px', background: '#333', color: '#0f0', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', minHeight: '200px' }}>
                {logs.length === 0 ? 'Waiting to start...' : logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>

            <div style={{ marginTop: '20px' }}>
                <Link to="/">Back to Home</Link>
            </div>
        </div>
    );
};

export default EmailDiagnostic;
