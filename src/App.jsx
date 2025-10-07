import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupsProvider } from './context/GroupsContext';
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

  return (
    <GroupsProvider>
      <GroupExpenseApp />
    </GroupsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
