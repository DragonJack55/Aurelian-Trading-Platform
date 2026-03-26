import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import ChatWidget from './components/ChatWidget';
import MainLayout from './layouts/MainLayout';

import Home from './pages/Home';
import Quotes from './pages/Quotes';
import Trading from './pages/Trading';
import Assets from './pages/Assets';
import Admin from './pages/Admin';
import SecurityCenter from './pages/SecurityCenter';
import ModifyPassword from './pages/ModifyPassword';
import Leaderboard from './pages/Leaderboard';

import { subscribeToUser } from './services/userService';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailDiagnostic from './components/EmailDiagnostic';
import ResetCache from './components/ResetCache';

import HelpCenter from './pages/Support/HelpCenter';
import Compliance from './pages/Support/Compliance';
import SubmitRequest from './pages/Support/SubmitRequest';

function App() {
  console.log('[App] Mounting Full App with BrowserRouter...');
  console.log('[App] Mounting Full App with BrowserRouter...');

  return (
    <AppProvider>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Note: Firebase auth is handled in AppContext.jsx via onAuthStateChanged
  // No additional session management needed here

  // Force Update Check
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();
        const localVersion = localStorage.getItem('app_version');

        if (localVersion && localVersion !== data.version) {
          console.log('[App] New version detected:', data.version);
          localStorage.setItem('app_version', data.version);
          // Hard reload to clear cache
          if ('serviceWorker' in navigator) {
            await Promise.all(
              (await navigator.serviceWorker.getRegistrations()).map(r => r.unregister())
            );
          }
          window.location.reload(true);
        } else {
          localStorage.setItem('app_version', data.version);
        }
      } catch (e) {
        console.error('Version check failed', e);
      }
    };

    // Check on mount and every minute
    checkVersion();
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  const [userEmail, setUserEmail] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.email;
    } catch {
      return null;
    }
  });

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserEmail(user?.email);
      } catch {
        setUserEmail(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Subscribe to user existence
  useEffect(() => {
    if (!userEmail) return;

    const unsubscribe = subscribeToUser(userEmail, (userData) => {
      if (userData === null) {
        console.warn('[Session] User missing from backend. Waiting 5s before logout...');
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user && user.email) {
            console.warn('[Session] User still missing. Preventing forced logout for debugging.');
            // localStorage.removeItem('user');
            // localStorage.removeItem('authToken');
            // window.dispatchEvent(new Event('storage'));
            // navigate('/');
          }
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [userEmail, navigate]);

  return (
    <div className="app">
      <Routes>
        {/* Public/Auth Routes (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-test" element={<EmailDiagnostic />} />
        <Route path="/reset-cache" element={<ResetCache />} />
        <Route path="/admin" element={<Admin />} />

        {/* Main Layout Routes (Ticker + Navbar + Content) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Quotes />} />
          <Route path="/trade" element={<Trading />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/security" element={<SecurityCenter />} />
          <Route path="/security/password/:type" element={<ModifyPassword />} />
          
          {/* Support Routes */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/submit-request" element={<SubmitRequest />} />

          {/* Backward compatibility */}
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/trading" element={<Trading />} />
        </Route>
      </Routes>

      {location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/admin') && <ChatWidget />}
    </div>
  );
}

export default App;
