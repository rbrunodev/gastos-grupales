import React, { useRef, useState } from 'react';
import { User, Lock, Eye, EyeOff, UserPlus, Loader2, Mail, AtSign, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  // errores por campo + global
  const [errors, setErrors] = useState({
    global: '',
    firstName: '', lastName: '', username: '', email: '',
    password: '', confirmPassword: ''
  });
  const [success, setSuccess] = useState('');

  // refs para enfocar el 1º error
  const refs = {
    firstName: useRef(null),
    lastName: useRef(null),
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

  const setField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', global: '' })); // limpia error del campo al tipear
    if (success) setSuccess('');
  };

  const validate = () => {
    const e = { global: '' };
    const { firstName, lastName, username, email, password, confirmPassword } = formData;

    if (!firstName) e.firstName = 'Ingresá tu nombre';
    else if (firstName.trim().length < 2) e.firstName = 'Mínimo 2 caracteres';

    if (!lastName) e.lastName = 'Ingresá tu apellido';
    else if (lastName.trim().length < 2) e.lastName = 'Mínimo 2 caracteres';

    if (!username) e.username = 'Elegí un usuario';
    else if (username.trim().length < 3) e.username = 'Mínimo 3 caracteres';

    if (!email) e.email = 'Ingresá tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';

    if (!password) e.password = 'Ingresá una contraseña';
    else if (password.length < 4) e.password = 'Mínimo 4 caracteres';

    if (!confirmPassword) e.confirmPassword = 'Repetí la contraseña';
    else if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';

    // enfocar el primer campo con error
    const firstError = ['firstName','lastName','username','email','password','confirmPassword']
      .find(k => e[k]);
    if (firstError) refs[firstError].current?.focus();

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate();
    if (Object.keys(eObj).length > 1) { setErrors(prev => ({ ...prev, ...eObj })); return; }

    try {
      const res = await register(formData); // { success, code?, error? }

      if (res?.success) {
        setErrors({ global: '' });
        setSuccess('¡Cuenta creada exitosamente! Redirigiendo…');
        // opcional: bloqueo suave de inputs
        setTimeout(() => onSwitchToLogin(), 1800);
        return;
      }

      // Normalizamos errores del backend
      const code = res?.code || res?.status || '';
      const msg  = res?.error || 'No pudimos crear tu cuenta. Intentalo de nuevo.';

      // mapeo fino de casos comunes
      if (code === 409 || code === 'USERNAME_TAKEN') {
        setErrors(prev => ({ ...prev, username: 'Ese usuario ya está en uso', global: '' }));
        refs.username.current?.focus();
      } else if (code === 'EMAIL_TAKEN') {
        setErrors(prev => ({ ...prev, email: 'Ese email ya está registrado', global: '' }));
        refs.email.current?.focus();
      } else if (code === 400 || code === 'WEAK_PASSWORD') {
        setErrors(prev => ({ ...prev, password: 'Contraseña débil', global: msg }));
        refs.password.current?.focus();
      } else {
        setErrors(prev => ({ ...prev, global: msg }));
      }
    } catch {
      setErrors(prev => ({ ...prev, global: 'Error de conexión. Verificá tu internet.' }));
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon"><UserPlus size={40} /></div>
            <h1>Crear Cuenta</h1>
            <p>Regístrate para empezar a usar Gastos Grupales</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {/* Nombre / Apellido */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    ref={refs.firstName}
                    id="firstName" name="firstName"
                    value={formData.firstName}
                    onChange={(e)=>setField('firstName', e.target.value)}
                    placeholder="Tu nombre"
                    className={errors.firstName ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.firstName}
                  />
                </div>
                {errors.firstName && <small className="field-error">{errors.firstName}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <div className="input-container">
                  <User className="input-icon" size={20} />
                  <input
                    ref={refs.lastName}
                    id="lastName" name="lastName"
                    value={formData.lastName}
                    onChange={(e)=>setField('lastName', e.target.value)}
                    placeholder="Tu apellido"
                    className={errors.lastName ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.lastName}
                  />
                </div>
                {errors.lastName && <small className="field-error">{errors.lastName}</small>}
              </div>
            </div>

            {/* Usuario / Email */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <div className="input-container">
                  <AtSign className="input-icon" size={20} />
                  <input
                    ref={refs.username}
                    id="username" name="username"
                    value={formData.username}
                    onChange={(e)=>setField('username', e.target.value)}
                    placeholder="Elige un nombre de usuario"
                    className={errors.username ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.username}
                  />
                </div>
                {errors.username && <small className="field-error">{errors.username}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <Mail className="input-icon" size={20} />
                  <input
                    ref={refs.email}
                    id="email" name="email"
                    value={formData.email}
                    onChange={(e)=>setField('email', e.target.value)}
                    placeholder="tu@email.com"
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <small className="field-error">{errors.email}</small>}
              </div>
            </div>

            {/* Contraseña / Confirmación */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    ref={refs.password}
                    type={showPassword ? 'text' : 'password'}
                    id="password" name="password"
                    value={formData.password}
                    onChange={(e)=>setField('password', e.target.value)}
                    placeholder="Crea una contraseña"
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={()=>setShowPassword(v=>!v)}
                    disabled={loading}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <small className="field-error">{errors.password}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    ref={refs.confirmPassword}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword" name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e)=>setField('confirmPassword', e.target.value)}
                    placeholder="Repite tu contraseña"
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={()=>setShowConfirmPassword(v=>!v)}
                    disabled={loading}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
              </div>
            </div>

            {/* Mensajes globales */}
            {errors.global && (
              <div className="error-message" role="alert" aria-live="assertive">{errors.global}</div>
            )}
            {success && (
              <div className="success-message" role="status" aria-live="polite">
                <CheckCircle2 size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} />
                {success}
              </div>
            )}

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? (<><Loader2 className="spin" size={20} />Creando cuenta…</>)
                       : (<><UserPlus size={20} />Crear Cuenta</>)}
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
