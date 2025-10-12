import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Pagos
const PAYMENTS_KEY = 'gg_payments_v1'; 
function loadPaymentsMap() {
  try { return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '{}'); }
  catch { return {}; }
}
function savePaymentsMap(map) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(map));
}
function getPaymentsForGroup(groupId) {
  const map = loadPaymentsMap();
  return map[groupId] || [];
}
function setPaymentsForGroup(groupId, payments) {
  const map = loadPaymentsMap();
  map[groupId] = payments;
  savePaymentsMap(map);
}

const GroupsContext = createContext();

const API_URL = 'http://localhost:3001/api';

export const GroupsProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
      const withPayments = (Array.isArray(userGroups) ? userGroups : []).map(g => ({
        ...g,
      payments: getPaymentsForGroup(g.id), 
      }));
      setGroups(withPayments);
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

  const cleaned = (memberUsernames || [])
    .map(m => (m || '').trim())
    .filter(Boolean);
  const allMembers = [...new Set([user.username, ...cleaned])];


  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupName,
        description: description || '',
        created_by: user.id,       
        members: allMembers,       
      }),
    });

    const text = await response.text(); 
    console.log('[createGroup] raw response:', response.status, text);

    if (!response.ok) {
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      return { success: false, message: (data?.error || text || `HTTP ${response.status}`) };
    }

    const data = JSON.parse(text || '{}');

    await loadUserGroups();
    return { success: true, data };
  } catch (error) {
    console.error('Error creando grupo:', error);
    return { success: false, message: error.message || 'Error de conexión' };
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

      const response = await fetch(`${API_URL}/expenses`, {  
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
        console.error('Server error response:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      await loadUserGroups();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('💥 Add expense error:', error);
      return { success: false, message: error.message };
    }
  };

  const addPayment = async (groupId, fromUsername, toUsername, amount) => {
  try {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const newPayment = {
        id: (crypto?.randomUUID?.() || String(Date.now())),
        from: fromUsername,
        to: toUsername,
        amount: Number(amount),
        createdAt: new Date().toISOString(),
      };
      const nextPayments = [...(g.payments || []), newPayment];
      setPaymentsForGroup(groupId, nextPayments);   // persistir local
      return { ...g, payments: nextPayments };
    }));
    return { success: true };
  } catch (e) {
    console.error('Error addPayment:', e);
    return { success: false, message: 'No se pudo registrar el pago' };
  }
};

const removePayment = async (groupId, paymentId) => {
  try {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const nextPayments = (g.payments || []).filter(p => p.id !== paymentId);
      setPaymentsForGroup(groupId, nextPayments);   // persistir local
      return { ...g, payments: nextPayments };
    }));
    return { success: true };
  } catch (e) {
    console.error('Error removePayment:', e);
    return { success: false, message: 'No se pudo deshacer el pago' };
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

  const calculateBalances = (group) => {
    if (!group?.expenses || !Array.isArray(group.expenses)) return {};

    const balances = {};
    
    if (group.members && Array.isArray(group.members)) {
      group.members.forEach(member => {
        balances[member] = 0;
      });
    }

    group.expenses.forEach(expense => {
      if (expense.amount && expense.paid_by_username && expense.splitBetween) {
        const { amount, paid_by_username, splitBetween } = expense;
        const sharePerPerson = amount / splitBetween.length;

        if (balances.hasOwnProperty(paid_by_username)) {
          balances[paid_by_username] += amount;
        }

        splitBetween.forEach(member => {
          if (balances.hasOwnProperty(member)) {
            balances[member] -= sharePerPerson;
          }
        });
      }
    });

  const payments = group.payments || [];
  for (const p of payments) {
    if (balances.hasOwnProperty(p.from)) {
      balances[p.from] = (balances[p.from] ?? 0) + Number(p.amount || 0);
    }
    if (balances.hasOwnProperty(p.to)) {
      balances[p.to] = (balances[p.to] ?? 0) - Number(p.amount || 0);
    }
  }

    return balances;
  };

  const calculateSettlements = (balances) => {
    const settlements = [];
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) {
        creditors.push({ person, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ person, amount: Math.abs(balance) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

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
    addPayment,
    removePayment,
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