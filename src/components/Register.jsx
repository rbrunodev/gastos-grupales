import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, UserPlus, Loader2, Mail, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const validateForm = () => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return 'Por favor, completa todos los campos';
    }
    
    if (firstName.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (lastName.length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    // Validación de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Por favor, ingresa un email válido';
    }
    
    if (password.length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres';
    }
    
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">
              <UserPlus size={40} />
            </div>
            <h1>Crear Cuenta</h1>
            <p>Regístrate para empezar a usar Gastos Grupales</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className={error ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    className={error ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <div className="input-container">
                <AtSign className="input-icon" size={20} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Elige un nombre de usuario"
                  className={error ? 'error' : ''}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
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
                  placeholder="Crea una contraseña"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={error ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spin" size={20} />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button 
                type="button" 
                className="switch-button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
