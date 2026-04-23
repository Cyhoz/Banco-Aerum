import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Shield } from 'lucide-react';

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
          full_name: formData.name,
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
      flexDirection: 'column',
      background: 'var(--aerum-gray-light)',
    }}>
      <div className="be-top-bar" />
      
      <header className="be-header-container">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Shield size={32} color="var(--aerum-gold)" />
            <div style={{ marginLeft: '12px' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0', color: 'var(--aerum-navy)', fontWeight: '800' }}>
                BANCO<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
              </h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--aerum-gray-medium)', fontWeight: '600', letterSpacing: '0.1em', marginTop: '-2px' }}>
                EXCELENCIA FINANCIERA
              </p>
            </div>
          </Link>
        </div>
      </header>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card"
          style={{ 
            width: '100%', 
            maxWidth: '440px', 
            borderRadius: '16px',
            borderBottom: '4px solid var(--aerum-gold)',
          }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--aerum-navy)', marginBottom: '10px' }}>
              {isLogin ? 'Acceso a Clientes' : 'Crea tu Cuenta Aerum'}
            </h2>
            <div style={{ width: '40px', height: '3px', background: 'var(--aerum-gold)', margin: '0 auto' }} />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              background: '#FEF2F2', 
              border: '1px solid #FEE2E2',
              color: '#B91C1C',
              marginBottom: '24px',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {typeof error === 'string' ? error : (error.message || 'Error en la autenticación')}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', marginLeft: '4px' }}>NOMBRE COMPLETO</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                  <input 
                    type="text" 
                    placeholder="Ej: Alejandro Silva"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      background: '#F9FAFB',
                      border: '1px solid var(--aerum-border)',
                      borderRadius: '8px',
                      color: 'var(--aerum-gray-dark)',
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
              <label style={{ display: 'block', color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', marginLeft: '4px' }}>CORREO ELECTRÓNICO</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                <input 
                  type="email" 
                  placeholder="usuario@aerum.com"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    background: '#F9FAFB',
                    border: '1px solid var(--aerum-border)',
                    borderRadius: '8px',
                    color: 'var(--aerum-gray-dark)',
                    outline: 'none'
                  }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', marginLeft: '4px' }}>CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    background: '#F9FAFB',
                    border: '1px solid var(--aerum-border)',
                    borderRadius: '8px',
                    color: 'var(--aerum-gray-dark)',
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
              style={{ width: '100%', marginBottom: '24px', padding: '16px' }}
            >
              {loading ? 'Validando...' : (isLogin ? 'Ingresar al sistema' : 'Crear mi cuenta')}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', color: 'var(--aerum-blue-light)', fontSize: '0.9rem', fontWeight: '600' }}
              >
                {isLogin ? '¿No eres cliente? Solicita tu cuenta' : '¿Ya eres cliente? Inicia sesión'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <footer style={{ background: 'var(--aerum-white)', borderTop: '1px solid var(--aerum-border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.85rem' }}>© 2026 Banco Aerum - Miembro de la Asociación de Bancos e Instituciones Financieras</p>
      </footer>
    </div>
  );
};

export default Auth;
