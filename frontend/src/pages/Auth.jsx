import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        await authService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        setIsLogin(true);
        setError('Registro exitoso. Por favor, inicia sesión.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0a0a0a 0%, #000 100%)',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="luxury-card auth-card"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ShieldCheck size={48} color="var(--gold-primary)" style={{ marginBottom: '16px' }} />
          <h1 className="gold-gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
             AUREUM BANK
          </h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            {isLogin ? 'EL PRESTIGIO DE TU FINANZA' : 'ÚNETE A LA EXCLUSIVIDAD'}
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.2)',
            color: '#ff6b6b',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {typeof error === 'string' ? error : (error.message || 'Error en la autenticación')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--gold-light)', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '4px' }}>NOMBRE COMPLETO</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Nombre Apellido"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'var(--bg-onyx)',
                    border: '1px solid var(--border-platinum)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--gold-light)', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '4px' }}>CORREO ELECTRÓNICO</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="usuario@aureum.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--bg-onyx)',
                  border: '1px solid var(--border-platinum)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: 'var(--gold-light)', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '4px' }}>CONTRASEÑA</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'var(--bg-onyx)',
                  border: '1px solid var(--border-platinum)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="gold-button"
            disabled={loading}
            style={{ width: '100%', marginBottom: '20px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Procesando...' : (isLogin ? 'Acceder al Club' : 'Crear Cuenta Premium')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', color: 'var(--text-gray)', fontSize: '0.85rem', textDecoration: 'underline' }}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
