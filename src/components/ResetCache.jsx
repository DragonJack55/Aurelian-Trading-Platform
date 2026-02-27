import React, { useEffect, useState } from 'react';

const ResetCache = () => {
    const [status, setStatus] = useState('Initializing reset...');

    useEffect(() => {
        const cleanup = async () => {
            try {
                // 1. Unregister Service Workers
                if ('serviceWorker' in navigator) {
                    setStatus('Unregistering Service Workers...');
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                        console.log('Unregistered SW:', registration);
                    }
                }

                // 2. Clear Cache Storage
                if ('caches' in window) {
                    setStatus('Clearing Cache Storage...');
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                }

                // 3. Clear Local Storage (Specific keys)
                setStatus('Clearing Local Storage...');
                localStorage.removeItem('app_version');
                localStorage.removeItem('user'); // Optional: force re-login if needed, but maybe keep it

                // 4. Force Reload
                setStatus('Done! Reloading...');
                setTimeout(() => {
                    // Force reload from server, ignoring cache
                    window.location.href = '/?t=' + Date.now();
                }, 1000);

            } catch (error) {
                console.error('Reset failed:', error);
                setStatus('Error: ' + error.message);
            }
        };

        cleanup();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold mb-2">System Update</h2>
            <p className="text-gray-400">{status}</p>
        </div>
    );
};

export default ResetCache;
