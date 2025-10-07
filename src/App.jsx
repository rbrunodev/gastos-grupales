import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import GroupExpenseApp from './GroupExpenseApp';
import Login from './components/Login';

function AppContent() {
  const { user, checkAuthState } = useAuth();

  useEffect(() => {
    checkAuthState();
  }, []);

  if (!user) {
    return <Login />;
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
