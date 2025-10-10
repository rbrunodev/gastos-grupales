import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GroupsContext = createContext();

const API_URL = 'http://localhost:3001/api';

export const GroupsProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar grupos cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      loadUserGroups();
    } else {
      setGroups([]);
    }
  }, [user]);

  const loadUserGroups = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/groups/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const userGroups = await response.json();
      setGroups(Array.isArray(userGroups) ? userGroups : []);
    } catch (error) {
      console.error('Error cargando grupos:', error);
      setError('Error cargando grupos');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupName, description, memberUsernames) => {
    if (!user?.id) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      // Asegurar que el creador esté en la lista de miembros
      const allMembers = [...new Set([user.username, ...memberUsernames])];
      
      const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: description || '',
          created_by: user.id,
          members: allMembers
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Recargar grupos
        await loadUserGroups();
        return { success: true };
      } else {
        return { success: false, message: data.error || 'Error creando el grupo' };
      }
    } catch (error) {
      console.error('Error creando grupo:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const addExpense = async (groupId, description, amount, paidBy, splitWith) => {
    try {
      console.log('📤 Sending expense data:', {
        groupId,
        description,
        amount,
        paidBy,
        splitWith
      });

      const response = await fetch(`${API_URL}/expenses`, {  // ← Quitar el /api/ duplicado
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grupo_id: groupId,
          description: description,
          amount: amount,
          paid_by_username: paidBy,
          split_between: splitWith
        })
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Server error response:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Expense added:', result);
      
      // Recargar grupos después de agregar el gasto
      await loadUserGroups();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('💥 Add expense error:', error);
      return { success: false, message: error.message };
    }
  };

  const getGroupById = (groupId) => {
    return groups.find(group => group.id === parseInt(groupId));
  };

  const getAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  };

  // Funciones de cálculo
  const calculateBalances = (group) => {
    if (!group?.expenses || !Array.isArray(group.expenses)) return {};

    const balances = {};
    
    // Inicializar balances para todos los miembros
    if (group.members && Array.isArray(group.members)) {
      group.members.forEach(member => {
        balances[member] = 0;
      });
    }

    // Calcular balances basado en gastos
    group.expenses.forEach(expense => {
      if (expense.amount && expense.paid_by_username && expense.splitBetween) {
        const { amount, paid_by_username, splitBetween } = expense;
        const sharePerPerson = amount / splitBetween.length;

        // El que pagó tiene crédito por el monto total
        if (balances.hasOwnProperty(paid_by_username)) {
          balances[paid_by_username] += amount;
        }

        // Cada participante debe su parte
        splitBetween.forEach(member => {
          if (balances.hasOwnProperty(member)) {
            balances[member] -= sharePerPerson;
          }
        });
      }
    });

    return balances;
  };

  const calculateSettlements = (balances) => {
    const settlements = [];
    const creditors = [];
    const debtors = [];

    // Separar acreedores y deudores
    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) {
        creditors.push({ person, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ person, amount: Math.abs(balance) });
      }
    });

    // Ordenar por monto (mayor primero)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Calcular liquidaciones
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const amount = Math.min(creditor.amount, debtor.amount);

      if (amount > 0.01) {
        settlements.push({
          from: debtor.person,
          to: creditor.person,
          amount: Math.round(amount * 100) / 100
        });
      }

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return settlements;
  };

  const isGroupBalanced = (group) => {
    const balances = calculateBalances(group);
    return Object.values(balances).every(balance => Math.abs(balance) < 0.01);
  };

  const value = {
    groups,
    loading,
    error,
    createGroup,
    addExpense,
    getGroupById,
    getAllUsers,
    calculateBalances,
    calculateSettlements,
    isGroupBalanced,
    refreshGroups: loadUserGroups
  };

  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups debe ser usado dentro de GroupsProvider');
  }
  return context;
};