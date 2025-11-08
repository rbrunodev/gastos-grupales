import React, { useState, useRef } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import Logo from '/gg.svg';


const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ global: '', username: '', password: '' });
  const { login, loading } = useAuth();

  const userRef = useRef(null);
  const passRef = useRef(null);

  const clearErrors = (field) => {
    setErrors(prev => ({ ...prev, [field]: '', global: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearErrors(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones rápidas en cliente
    const newErr = { global: '', username: '', password: '' };
    if (!formData.username) newErr.username = 'Ingresá tu usuario';
    if (!formData.password) newErr.password = 'Ingresá tu contraseña';

    if (newErr.username || newErr.password) {
      setErrors(newErr);
      if (newErr.username) userRef.current?.focus();
      else passRef.current?.focus();
      return;
    }

    try {
      const result = await login(formData.username, formData.password);
      // Normalizamos posibles formatos de error desde el AuthContext/API
      if (!result?.success) {
        const code = result?.code || result?.status || ''; // p.ej. 'USER_NOT_FOUND', 401, etc.
        let globalMsg = result?.error || 'Usuario o contraseña incorrectos';

        // Mapeo fino por códigos/status comunes
        if (code === 404 || code === 'USER_NOT_FOUND') {
          setErrors({ global: globalMsg, username: 'No encontramos ese usuario', password: '' });
          userRef.current?.focus();
        } else if (code === 401 || code === 'INVALID_CREDENTIALS') {
          setErrors({ global: globalMsg, username: '', password: 'Contraseña incorrecta' });
          setFormData(prev => ({ ...prev, password: '' }));
          passRef.current?.focus();
        } else if (code === 429 || code === 'TOO_MANY_ATTEMPTS') {
          setErrors({ global: 'Demasiados intentos. Probá de nuevo en unos minutos.', username: '', password: '' });
        } else {
          setErrors({ global: globalMsg, username: '', password: '' });
        }
        return;
      }

      // éxito -> no hacemos nada acá (tu flujo redirige desde el contexto/app)
    } catch (err) {
      setErrors({
        global: 'No pudimos conectar con el servidor. Intentá de nuevo.',
        username: '',
        password: ''
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <img src={Logo} alt="Logo" className="login-logo" />
            </div>

            <h1>Gastos Grupales</h1>
            <p>Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-container">
                <User className="input-icon" size={20} />
                <input
                  ref={userRef}
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className={(errors.username || errors.global) ? 'error' : ''}
                  disabled={loading}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
              </div>
              {errors.username && (
                <small id="username-error" className="field-error">{errors.username}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input
                  ref={passRef}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className={(errors.password || errors.global) ? 'error' : ''}
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <small id="password-error" className="field-error">{errors.password}</small>
              )}
            </div>

            {errors.global && (
              <div className="error-message" role="alert" aria-live="assertive">
                {errors.global}
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

          {/* Demo users (tu bloque, lo dejo igual) */}
          {/* <div className="mt-2 rounded-xl border border-dashed border-blue-200 px-4 py-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">
              Usuarios de demostración
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-900">
                <strong>admin</strong> / admin123
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-900">
                <strong>usuario</strong> / 123456
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-900">
                <strong>test</strong> / test
              </div>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default Login;
