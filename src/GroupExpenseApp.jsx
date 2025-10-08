import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupsProvider, useGroups } from './context/GroupsContext';
import Auth from './components/Auth';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import CreateGroupModal from './modals/CreateGroupModal';
import AddExpenseModal from './modals/AddExpenseModal';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    groups, 
    loading: groupsLoading, 
    getGroupById, 
    calculateBalances, 
    calculateSettlements, 
    isGroupBalanced 
  } = useGroups();
  
  const [currentView, setCurrentView] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si está cargando la autenticación, mostrar loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
    setShowCreateGroupModal(true);
    setSidebarOpen(false);
  };

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const renderGroupsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Grupos</h1>
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Crear Grupo
        </button>
      </div>

      {groupsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando grupos...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes grupos aún</h3>
          <p className="text-gray-500 mb-4">Crea tu primer grupo para empezar a gestionar gastos compartidos</p>
          <button
            onClick={handleCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Crear mi primer grupo
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const balances = calculateBalances(group);
            const totalExpenses = group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
            const balanced = isGroupBalanced(group);

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
                onClick={() => handleViewGroup(group.id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{group.name}</h3>
                    {balanced ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Balanceado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.members?.length || 0} miembros</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Total: ${totalExpenses.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>{group.expenses?.length || 0} gastos</span>
                    </div>
                  </div>

                  {group.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{group.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGroupDetail = () => {
    if (!selectedGroup) return null;

    const balances = calculateBalances(selectedGroup);
    const settlements = calculateSettlements(balances);
    const totalExpenses = selectedGroup.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const balanced = isGroupBalanced(selectedGroup);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <button
              onClick={handleBackToGroups}
              className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
            >
              ← Volver a grupos
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{selectedGroup.name}</h1>
            {selectedGroup.description && (
              <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
            )}
          </div>
          <button
            onClick={handleAddExpense}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Agregar Gasto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Miembros</p>
                <p className="text-xl font-semibold text-gray-900">{selectedGroup.members?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                <p className="text-xl font-semibold text-gray-900">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center">
              {balanced ? (
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <p className="text-xl font-semibold text-gray-900">
                  {balanced ? 'Balanceado' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Miembros</h2>
          <div className="flex flex-wrap gap-2">
            {selectedGroup.members?.map((member) => (
              <span
                key={member}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {member}
              </span>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos Recientes</h2>
          {selectedGroup.expenses?.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay gastos registrados</p>
          ) : (
            <div className="space-y-3">
              {selectedGroup.expenses?.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      Pagado por {expense.paid_by_username} • Dividido entre {expense.splitBetween?.join(', ')}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Balances */}
        {Object.keys(balances).length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Balances</h2>
            <div className="space-y-2">
              {Object.entries(balances).map(([member, balance]) => (
                <div key={member} className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{member}</span>
                  <span className={`font-semibold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    ${Math.abs(balance).toFixed(2)} {balance > 0 ? 'a favor' : balance < 0 ? 'debe' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlements */}
        {settlements.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Liquidaciones Sugeridas</h2>
            <div className="space-y-2">
              {settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-900">
                    <strong>{settlement.from}</strong> debe pagar a <strong>{settlement.to}</strong>
                  </span>
                  <span className="font-semibold text-blue-600">${settlement.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateGroup={handleCreateGroup}
        selectedGroupId={selectedGroupId}
        onViewGroup={handleViewGroup}
      />

      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentView === 'groups' && renderGroupsList()}
          {currentView === 'groupDetail' && renderGroupDetail()}
        </div>
      </main>

      {/* Modales */}
      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={() => {
            setShowCreateGroupModal(false);
            // Los grupos se recargan automáticamente por el contexto
          }}
        />
      )}

      {showAddExpenseModal && selectedGroup && (
        <AddExpenseModal
          group={selectedGroup}
          onClose={() => setShowAddExpenseModal(false)}
          onExpenseAdded={() => {
            setShowAddExpenseModal(false);
            // Los gastos se recargan automáticamente por el contexto
          }}
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