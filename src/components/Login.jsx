import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <User size={40} />
            </div>
            <h1>Gastos Grupales</h1>
            <p>Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-container">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className={error ? 'error' : ''}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={error ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spin" size={20} />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta?{' '}
              <button 
                type="button" 
                className="switch-button"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Regístrate
              </button>
            </p>
          </div>

          <div className="login-demo-info">
            <h4>Usuarios de demostración:</h4>
            <div className="demo-users">
              <div className="demo-user">
                <strong>admin</strong> / admin123
              </div>
              <div className="demo-user">
                <strong>usuario</strong> / 123456
              </div>
              <div className="demo-user">
                <strong>test</strong> / test
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
