import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GroupsContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups debe ser usado dentro de un GroupsProvider');
  }
  return context;
};

export const GroupsProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Clave para localStorage específica del usuario
  const getStorageKey = (userId) => `groups_user_${userId}`;

  // Datos de ejemplo por defecto para nuevos usuarios
  const getDefaultGroups = () => [
    {
      id: 1,
      name: "Asado con amigos",
      date: "2 días atrás",
      members: ["Ana", "Bruno", "Carlos", "Diana"],
      balance: 850,
      createdBy: user?.id,
      createdAt: new Date().toISOString(),
      expenses: [
        { 
          id: 1, 
          description: "Carne y choripán", 
          amount: 2400, 
          paidBy: "Bruno", 
          splitWith: ["Ana", "Bruno", "Carlos", "Diana"],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: 2, 
          description: "Bebidas", 
          amount: 1800, 
          paidBy: "Ana", 
          splitWith: ["Ana", "Bruno", "Carlos", "Diana"],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: 3, 
          description: "Carbón", 
          amount: 600, 
          paidBy: "Carlos", 
          splitWith: ["Ana", "Bruno", "Carlos", "Diana"],
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 2,
      name: "Viaje a Bariloche",
      date: "1 semana atrás",
      members: ["Laura", "Martín", "Sofia", "Pablo", "Elena"],
      balance: 2340,
      createdBy: user?.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expenses: [
        { 
          id: 4, 
          description: "Hospedaje", 
          amount: 8000, 
          paidBy: "Laura", 
          splitWith: ["Laura", "Martín", "Sofia", "Pablo", "Elena"],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: 5, 
          description: "Nafta", 
          amount: 3500, 
          paidBy: "Martín", 
          splitWith: ["Laura", "Martín", "Sofia", "Pablo"],
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
          id: 6, 
          description: "Cena restaurante", 
          amount: 4200, 
          paidBy: "Sofia", 
          splitWith: ["Laura", "Martín", "Sofia", "Pablo", "Elena"],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  // Cargar grupos del usuario actual
  const loadGroups = () => {
    if (!user) {
      setGroups([]);
      return;
    }

    setLoading(true);
    const storageKey = getStorageKey(user.id);
    const savedGroups = localStorage.getItem(storageKey);
    
    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups);
        setGroups(parsedGroups);
      } catch (error) {
        console.error('Error parsing saved groups:', error);
        setGroups(getDefaultGroups());
      }
    } else {
      // Primera vez del usuario, crear grupos de ejemplo
      const defaultGroups = getDefaultGroups();
      setGroups(defaultGroups);
      saveGroups(defaultGroups);
    }
    setLoading(false);
  };

  // Guardar grupos en localStorage
  const saveGroups = (groupsToSave) => {
    if (!user) return;
    const storageKey = getStorageKey(user.id);
    localStorage.setItem(storageKey, JSON.stringify(groupsToSave));
  };

  // Crear nuevo grupo
  const createGroup = async (groupData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGroup = {
      id: Date.now(), // En una DB real sería un ID auto-generado
      name: groupData.name,
      members: groupData.members || [],
      balance: 0,
      expenses: [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      date: "Ahora"
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    setLoading(false);
    return { success: true, group: newGroup };
  };

  // Actualizar grupo existente
  const updateGroup = async (groupId, updates) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedGroups = groups.map(group =>
      group.id === groupId 
        ? { ...group, ...updates, updatedAt: new Date().toISOString() }
        : group
    );
    
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    setLoading(false);
    return { success: true };
  };

  // Eliminar grupo
  const deleteGroup = async (groupId) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    setLoading(false);
    return { success: true };
  };

  // Agregar gasto a un grupo
  const addExpense = async (groupId, expenseData) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newExpense = {
      id: Date.now(),
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            expenses: [...group.expenses, newExpense],
            updatedAt: new Date().toISOString()
          }
        : group
    );
    
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    setLoading(false);
    return { success: true, expense: newExpense };
  };

  // Eliminar gasto de un grupo
  const deleteExpense = async (groupId, expenseId) => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            expenses: group.expenses.filter(expense => expense.id !== expenseId),
            updatedAt: new Date().toISOString()
          }
        : group
    );
    
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    setLoading(false);
    return { success: true };
  };

  // Obtener grupo por ID
  const getGroupById = (groupId) => {
    return groups.find(group => group.id === groupId);
  };

  // Cargar grupos cuando el usuario cambie
  useEffect(() => {
    loadGroups();
  }, [user]);

  const value = {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addExpense,
    deleteExpense,
    getGroupById,
    loadGroups
  };

  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
};
