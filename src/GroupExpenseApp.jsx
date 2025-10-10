import React, { useState, useEffect } from 'react';
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
    isGroupBalanced,
    addExpense
  } = useGroups();
  
  const [currentView, setCurrentView] = useState('groups');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // Mover aquí

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

  const handleShowReminders = () => {
    setCurrentView('reminders');
    setSidebarOpen(false);
  };

  // Función para calcular recordatorios de deudas
  const calculateReminders = () => {
    const reminders = {
      owedToMe: [], // Quienes me deben
      iOwe: []      // A quienes les debo
    };

    groups.forEach(group => {
      const balances = calculateBalances(group);
      const settlements = calculateSettlements(balances);
      
      settlements.forEach(settlement => {
        if (settlement.to === user.username) {
          // Alguien me debe dinero
          reminders.owedToMe.push({
            groupName: group.name,
            groupId: group.id,
            person: settlement.from,
            amount: settlement.amount
          });
        } else if (settlement.from === user.username) {
          // Yo le debo dinero a alguien
          reminders.iOwe.push({
            groupName: group.name,
            groupId: group.id,
            person: settlement.to,
            amount: settlement.amount
          });
        }
      });
    });

    return reminders;
  };

  const renderRemindersView = () => {
    const reminders = calculateReminders();
    const totalOwedToMe = reminders.owedToMe.reduce((sum, debt) => sum + debt.amount, 0);
    const totalIOwe = reminders.iOwe.reduce((sum, debt) => sum + debt.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recordatorios de Deudas</h2>
          <button
            onClick={() => setCurrentView('groups')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Volver a grupos
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Te deben en total</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${totalOwedToMe.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">{reminders.owedToMe.length} deudas pendientes</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Debes en total</span>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              ${totalIOwe.toFixed(2)}
            </div>
            <p className="text-xs text-red-600 mt-1">{reminders.iOwe.length} pagos pendientes</p>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-4 border ${
            totalOwedToMe - totalIOwe > 0 
              ? 'from-blue-50 to-indigo-50 border-blue-200' 
              : totalOwedToMe - totalIOwe < 0 
                ? 'from-orange-50 to-amber-50 border-orange-200'
                : 'from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                totalOwedToMe - totalIOwe > 0 
                  ? 'text-blue-700' 
                  : totalOwedToMe - totalIOwe < 0 
                    ? 'text-orange-700'
                    : 'text-gray-700'
              }`}>
                Balance Neto
              </span>
              <div className={`w-2 h-2 rounded-full ${
                totalOwedToMe - totalIOwe > 0 
                  ? 'bg-blue-500' 
                  : totalOwedToMe - totalIOwe < 0 
                    ? 'bg-orange-500'
                    : 'bg-gray-500'
              }`}></div>
            </div>
            <div className={`text-2xl font-bold ${
              totalOwedToMe - totalIOwe > 0 
                ? 'text-blue-600' 
                : totalOwedToMe - totalIOwe < 0 
                  ? 'text-orange-600'
                  : 'text-gray-600'
            }`}>
              {totalOwedToMe - totalIOwe >= 0 ? '+' : ''}${(totalOwedToMe - totalIOwe).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Dinero que te deben */}
        {reminders.owedToMe.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              Te deben dinero ({reminders.owedToMe.length})
            </h2>
            <div className="space-y-3">
              {reminders.owedToMe.map((debt, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">
                          <strong>{debt.person}</strong> te debe
                        </p>
                        <p className="text-sm text-green-700">
                          En el grupo: {debt.groupName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${debt.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleViewGroup(debt.groupId)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        Ver Grupo
                      </button>
                      <button className="text-xs border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded-full transition-colors">
                        Enviar Recordatorio
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dinero que debes */}
        {reminders.iOwe.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              Debes dinero ({reminders.iOwe.length})
            </h2>
            <div className="space-y-3">
              {reminders.iOwe.map((debt, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">
                          Le debes a <strong>{debt.person}</strong>
                        </p>
                        <p className="text-sm text-red-700">
                          En el grupo: {debt.groupName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          ${debt.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleViewGroup(debt.groupId)}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        Ver Grupo
                      </button>
                      <button className="text-xs border border-red-600 text-red-600 hover:bg-red-50 px-3 py-1 rounded-full transition-colors">
                        Marcar como Pagado
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado sin deudas */}
        {reminders.owedToMe.length === 0 && reminders.iOwe.length === 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                ¡Todo al día! 🎉
              </h3>
              <p className="text-gray-600">
                No tienes deudas pendientes en ninguno de tus grupos.
              </p>
            </div>
          </div>
        )}

        {/* Consejos */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            💡 Consejos para mantener las cuentas al día
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
            <li>Revisa regularmente tus recordatorios para evitar que se acumulen las deudas</li>
            <li>Comunícate con los miembros del grupo sobre los pagos pendientes</li>
            <li>Utiliza las liquidaciones sugeridas para minimizar las transferencias</li>
            <li>Registra los pagos tan pronto como se realicen</li>
          </ul>
        </div>
      </div>
    );
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

        {/* Balances - PRIMERO */}
        {Object.keys(balances).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Balances
            </h2>
            <div className="space-y-3">
              {Object.entries(balances).map(([member, balance]) => (
                <div key={member} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{member}</span>
                  <span className={`font-bold text-lg ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    ${Math.abs(balance).toFixed(2)} {balance > 0 ? 'a favor' : balance < 0 ? 'debe' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlements - SEGUNDO */}
        {settlements.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              Liquidaciones Sugeridas
            </h2>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-gray-900">
                    <strong className="text-blue-800">{settlement.from}</strong> debe pagar a <strong className="text-blue-800">{settlement.to}</strong>
                  </span>
                  <span className="font-bold text-lg text-blue-600">${settlement.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    );
  };

  const renderProfileView = () => {
    if (!user) return null;

    // Calcular estadísticas financieras del usuario
    const calculateUserFinancialStats = () => {
      let totalOwed = 0;      // Cuánto le deben al usuario
      let totalOwes = 0;      // Cuánto debe el usuario
      let totalExpenses = 0;  // Total de gastos en todos los grupos
      let totalGroupsWithDebts = 0;
      
      groups.forEach(group => {
        const balances = calculateBalances(group);
        const userBalance = balances[user.username] || 0;
        
        if (userBalance > 0) {
          totalOwed += userBalance;
        } else if (userBalance < 0) {
          totalOwes += Math.abs(userBalance);
        }
        
        if (userBalance !== 0) {
          totalGroupsWithDebts++;
        }
        
        // Sumar gastos totales del grupo
        totalExpenses += group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      });

      return {
        totalOwed,
        totalOwes,
        totalExpenses,
        netBalance: totalOwed - totalOwes,
        totalGroupsWithDebts,
        totalGroups: groups.length,
        totalTransactions: groups.reduce((total, group) => total + (group.expenses?.length || 0), 0)
      };
    };

    const financialStats = calculateUserFinancialStats();

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        
        {/* Información del Usuario */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.full_name || user.username || 'Usuario'}
              </h2>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div className="space-y-3">
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Nombre de usuario:</span>
                  <span className="text-sm text-gray-900">@{user.username}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">ID de usuario:</span>
                  <span className="text-sm text-gray-500 font-mono">{user.id}</span>
                </div>
                
                {user.email && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Estadísticas Generales</h3>
              
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Grupos</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{financialStats.totalGroups}</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Total en Gastos</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      ${financialStats.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">Total Transacciones</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {financialStats.totalTransactions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Resumen Financiero</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dinero que te deben */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Te deben</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${financialStats.totalOwed.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1">A tu favor</p>
            </div>

            {/* Dinero que debes */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">Debes</span>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                ${financialStats.totalOwes.toFixed(2)}
              </div>
              <p className="text-xs text-red-600 mt-1">Pendiente de pago</p>
            </div>

            {/* Balance neto */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
              financialStats.netBalance > 0 
                ? 'from-blue-50 to-indigo-50 border-blue-200' 
                : financialStats.netBalance < 0 
                  ? 'from-orange-50 to-amber-50 border-orange-200'
                  : 'from-gray-50 to-slate-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  financialStats.netBalance > 0 
                    ? 'text-blue-700' 
                    : financialStats.netBalance < 0 
                      ? 'text-orange-700'
                      : 'text-gray-700'
                }`}>
                  Balance Neto
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  financialStats.netBalance > 0 
                    ? 'bg-blue-500' 
                    : financialStats.netBalance < 0 
                      ? 'bg-orange-500'
                      : 'bg-gray-500'
                }`}></div>
              </div>
              <div className={`text-2xl font-bold ${
                financialStats.netBalance > 0 
                  ? 'text-blue-600' 
                  : financialStats.netBalance < 0 
                    ? 'text-orange-600'
                    : 'text-gray-600'
              }`}>
                {financialStats.netBalance >= 0 ? '+' : ''}${financialStats.netBalance.toFixed(2)}
              </div>
              <p className={`text-xs mt-1 ${
                financialStats.netBalance > 0 
                  ? 'text-blue-600' 
                  : financialStats.netBalance < 0 
                    ? 'text-orange-600'
                    : 'text-gray-600'
              }`}>
                {financialStats.netBalance > 0 
                  ? 'En positivo' 
                  : financialStats.netBalance < 0 
                    ? 'En negativo'
                    : 'Balanceado'
                }
              </p>
            </div>

            {/* Grupos con deudas */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Grupos Activos</span>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {financialStats.totalGroupsWithDebts}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                de {financialStats.totalGroups} total
              </p>
            </div>
          </div>

          {/* Indicador de estado general */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Estado Financiero General</p>
                <p className="text-xs text-gray-600 mt-1">
                  Basado en todos tus grupos
                </p>
              </div>
              <div className="flex items-center">
                {financialStats.netBalance > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-700">Favorable</span>
                  </>
                ) : financialStats.netBalance < 0 ? (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-orange-700">Debes dinero</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Balanceado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Próximas Funcionalidades */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Próximamente: Edición de Perfil
              </h3>
              <p className="text-blue-800 mb-4">
                Estamos trabajando en nuevas funcionalidades para tu perfil. Pronto podrás:
              </p>
              <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Cambiar tu nombre y información personal</li>
                <li>Actualizar tu foto de perfil</li>
                <li>Configurar preferencias de notificaciones</li>
                <li>Gestionar la privacidad de tu cuenta</li>
                <li>Ver un historial detallado de tus gastos</li>
                <li>Exportar reportes financieros</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones de Cuenta</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors cursor-not-allowed"
              disabled
            >
              Editar Perfil (Próximamente)
            </button>
            <button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors cursor-not-allowed"
              disabled
            >
              Cambiar Contraseña (Próximamente)
            </button>
            <button 
              className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors cursor-not-allowed"
              disabled
            >
              Eliminar Cuenta (Próximamente)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    const handleThemeChange = (newTheme) => {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Aplicar el tema al documento
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        
        {/* Configuración de Tema */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalización</h2>
          
          <div className="space-y-6">
            {/* Selector de Tema */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tema de la aplicación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tema Claro */}
                <div 
                  className={`relative rounded-lg border-2 cursor-pointer transition-all p-4 ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Tema Claro</h4>
                      <p className="text-sm text-gray-500">Interfaz brillante y clara</p>
                    </div>
                    {theme === 'light' && (
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tema Oscuro */}
                <div 
                  className={`relative rounded-lg border-2 cursor-pointer transition-all p-4 ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">Tema Oscuro</h4>
                      <p className="text-sm text-gray-500">Interfaz oscura para reducir fatiga visual</p>
                    </div>
                    {theme === 'dark' && (
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                {theme === 'light' 
                  ? 'Actualmente usando el tema claro. La interfaz se muestra con colores brillantes y fondos claros.' 
                  : 'Actualmente usando el tema oscuro. La interfaz se muestra con colores oscuros para reducir la fatiga visual.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Otras Configuraciones */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Recordatorios de pago</span>
              <button 
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed"
                disabled
              >
                Próximamente
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Nuevos gastos en grupos</span>
              <button 
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed"
                disabled
              >
                Próximamente
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Resumen semanal</span>
              <button 
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed"
                disabled
              >
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Configuración de Privacidad */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacidad</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Visibilidad del perfil</span>
              <button 
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed"
                disabled
              >
                Próximamente
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Compartir estadísticas</span>
              <button 
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed"
                disabled
              >
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Información de la Aplicación */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Versión de la aplicación:</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Última actualización:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHelpView = () => {
    const toggleFaq = (index) => {
      setExpandedFaq(expandedFaq === index ? null : index);
    };

    const faqs = [
      {
        question: "¿Cómo funciona el cálculo de balances?",
        answer: "El sistema calcula automáticamente cuánto debe o le deben a cada miembro del grupo. Cuando agregas un gasto, se divide equitativamente entre los miembros seleccionados, y el balance muestra la diferencia entre lo que cada persona pagó y lo que debería pagar."
      },
      {
        question: "¿Qué son las liquidaciones sugeridas?",
        answer: "Las liquidaciones sugeridas te muestran la forma más eficiente de saldar las deudas del grupo. En lugar de que cada persona pague a todas las demás, el sistema calcula el mínimo número de transferencias necesarias para que todos queden a mano."
      },
      {
        question: "¿Puedo agregar miembros después de crear un grupo?",
        answer: "Actualmente, los miembros se agregan al momento de crear el grupo. La funcionalidad para agregar o quitar miembros después de la creación estará disponible en futuras actualizaciones."
      },
      {
        question: "¿Los datos están seguros?",
        answer: "Sí, todos los datos se almacenan de forma segura y solo son accesibles por ti y los miembros de tus grupos. Utilizamos medidas de seguridad estándar para proteger tu información."
      },
      {
        question: "¿Puedo editar o eliminar gastos?",
        answer: "Esta funcionalidad estará disponible próximamente. Por ahora, si necesitas hacer correcciones, puedes crear un nuevo gasto con el monto ajustado."
      }
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Ayuda y Soporte</h1>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preguntas Frecuentes</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedFaq === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 pt-3">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas más ayuda?</h2>
          <p className="text-blue-800 mb-4">
            Si tienes alguna pregunta que no está en las FAQ o encuentras algún problema, 
            no dudes en contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Contactar Soporte
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
              Reportar un Error
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
        onShowReminders={handleShowReminders}
        selectedGroupId={selectedGroupId}
        onViewGroup={handleViewGroup}
      />

      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentView === 'groups' && renderGroupsList()}
          {currentView === 'groupDetail' && renderGroupDetail()}
          {currentView === 'profile' && renderProfileView()}
          {currentView === 'settings' && renderSettingsView()}
          {currentView === 'help' && renderHelpView()}
          {currentView === 'reminders' && renderRemindersView()}
        </div>
      </main>

      {/* Modales */}
      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={() => {
            setShowCreateGroupModal(false);
          }}
        />
      )}

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