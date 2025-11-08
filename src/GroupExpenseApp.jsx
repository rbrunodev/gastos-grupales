import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupsProvider, useGroups } from './context/GroupsContext';
import Auth from './components/Auth';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import PersonalBalance from './pages/PersonalBalance';
import Help from './pages/Help';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import GroupDetail from './pages/GroupDetail';
import GroupsList from './pages/GroupsList';
import AddExpenseModal from './modals/AddExpenseModal';
import CreateGroup from './pages/CreateGroup';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    getGroupById, 
    addExpense
  } = useGroups();
  
  const [currentView, setCurrentView] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar tema al cargar
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Si está cargando la autenticación, mostrar loading
  if (authLoading) {
    return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 md:flex">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <Auth />;
  }

  const selectedGroup = selectedGroupId ? getGroupById(selectedGroupId) : null;

  const handleViewGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setCurrentView('groupDetail');
    setSidebarOpen(false);
  };

  const handleBackToGroups = () => {
    setCurrentView('groups');
    setSelectedGroupId(null);
  };

  const handleCreateGroup = () => {
    setCurrentView('createGroup');
    setSidebarOpen(false);
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleAddExpenseSuccess = async (expense) => {
    try {
      // Usar el contexto para agregar el gasto
      const result = await addExpense(
        selectedGroupId,
        expense.description,
        expense.amount,
        expense.paidBy,
        expense.splitWith
      );
      
      if (result && result.success) {
        setShowAddExpenseModal(false);
        // Los datos se actualizarán automáticamente por el contexto
      } else {
        throw new Error(result?.message || 'Error al agregar el gasto');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      // El error se manejará en el modal
      throw error;
    }
  };

  const handleShowPersonalBalance = () => {
    setCurrentView('personalBalance');
    setSidebarOpen(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 md:flex">
      <NavBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
        currentScreen={currentView}
        onNavigate={(screen) => {
          if (screen === 'home') {
            setCurrentView('groups');
            setSelectedGroupId(null);
          } else {
            setCurrentView(screen);
          }
          setSidebarOpen(false);
        }}
        onCreateGroup={handleCreateGroup}
        onShowPersonalBalance={handleShowPersonalBalance}
        selectedGroupId={selectedGroupId}
        onViewGroup={handleViewGroup}
      />

      <main className="flex-1 pt-20 md:pt-24 pb-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {currentView === 'createGroup' && (
            <CreateGroup
              onCancel={() => setCurrentView('groups')}
              onCreated={() => setCurrentView('groups')}
            />
          )}
          {currentView === 'groups' && (
            <GroupsList
              onCreateGroup={() => setCurrentView('createGroup')}
              onViewGroup={handleViewGroup}
            />
          )}
          {currentView === 'groupDetail' && (
            <GroupDetail
              group={selectedGroup}
              onBack={handleBackToGroups}
              onAddExpense={handleAddExpense}
            />
          )}
          {currentView === 'profile' && <Profile />}
          {/* {currentView === 'settings' && (
            <Settings
              theme={theme}
              setTheme={setTheme}
              onBack={() => setCurrentView('groups')} 
            />
          )} */}
          {currentView === 'help' && (
            <Help onBack={() => setCurrentView('groups')} />
          )}
          {currentView === 'personalBalance' && (
          <PersonalBalance
            onBack={() => setCurrentView('groups')}
            onViewGroup={handleViewGroup}
          />
        )}
        </div>
      </main>

      {/* Modales */}

      {showAddExpenseModal && selectedGroup && (
        <AddExpenseModal
          open={showAddExpenseModal}
          group={selectedGroup}
          onClose={() => setShowAddExpenseModal(false)}
          onAdd={handleAddExpenseSuccess}
        />
      )}
    </div>
  );
};

const GroupExpenseApp = () => {
  return (
    <AuthProvider>
      <GroupsProvider>
        <AppContent />
      </GroupsProvider>
    </AuthProvider>
  );
};

export default GroupExpenseApp;