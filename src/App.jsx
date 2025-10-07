import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import GroupExpenseApp from './GroupExpenseApp';
import Auth from './components/Auth';

function AppContent() {
  const { user, checkAuthState } = useAuth();

  useEffect(() => {
    checkAuthState();
  }, []);

  if (!user) {
    return <Auth />;
  }

  return <GroupExpenseApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
