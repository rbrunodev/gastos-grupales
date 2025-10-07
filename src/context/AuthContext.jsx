import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Cargar usuarios del localStorage o usar valores por defecto
  const getUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    // Usuarios de ejemplo por defecto
    return [
      { id: 1, username: 'admin', password: 'admin123', name: 'Administrador', email: 'admin@gastos.com' },
      { id: 2, username: 'usuario', password: '123456', name: 'Usuario Demo', email: 'usuario@demo.com' },
      { id: 3, username: 'test', password: 'test', name: 'Usuario de Prueba', email: 'test@prueba.com' }
    ];
  };

  const [users, setUsers] = useState(getUsers());

  const login = async (username, password) => {
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validaciones
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    
    if (existingUser) {
      setLoading(false);
      if (existingUser.username === userData.username) {
        return { success: false, error: 'El nombre de usuario ya está en uso' };
      } else {
        return { success: false, error: 'El email ya está registrado' };
      }
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      username: userData.username,
      password: userData.password,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    
    // Actualizar lista de usuarios
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Auto-login después del registro
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const checkAuthState = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
