import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  ChevronLeft,
  Mail,
  Shield,
  User,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'user' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await adminService.listUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.createUser(formData);
      setShowModal(false);
      setFormData({ email: '', password: '', full_name: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      alert("Error al crear usuario: " + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${name}?`)) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert("Error al eliminar usuario: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--aerum-gray-light)' }}>
      <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aerum-gray-light)' }}>
      <div className="be-top-bar" />
      
      <header className="be-header-container">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/admin" style={{ color: 'var(--aerum-navy)', background: 'var(--aerum-gray-light)', padding: '8px', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={24} /></Link>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <Users color="var(--aerum-gold)" size={32} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--aerum-navy)', margin: 0 }}>
                GESTIÓN DE<span style={{ color: 'var(--aerum-gold)' }}>USUARIOS</span>
              </h2>
            </Link>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="gold-button"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <UserPlus size={20} />
            <span>NUEVO USUARIO</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 20px' }}>
        <div className="luxury-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Directorio de Clientes</h3>
              <p style={{ color: 'var(--aerum-gray-medium)', fontWeight: '500' }}>Administra el acceso y roles de los integrantes del ecosistema.</p>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..."
                style={{ padding: '12px 12px 12px 48px', background: '#F9FAFB', border: '1px solid var(--aerum-border)', borderRadius: '10px', width: '350px', fontWeight: '500' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', color: 'var(--aerum-navy)', fontSize: '0.85rem', fontWeight: '800' }}>
                  <th style={{ padding: '20px' }}>NOMBRE COMPLETO</th>
                  <th style={{ padding: '20px' }}>CORREO ELECTRÓNICO</th>
                  <th style={{ padding: '20px' }}>ROL</th>
                  <th style={{ padding: '20px' }}>ÚLTIMO ACCESO</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--aerum-border)', fontSize: '0.95rem' }}>
                    <td style={{ padding: '20px', fontWeight: '700', color: 'var(--aerum-navy)' }}>
                      {u.user_metadata?.full_name || 'Sin nombre'}
                    </td>
                    <td style={{ padding: '20px', color: 'var(--aerum-gray-medium)' }}>{u.email}</td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                        background: (u.user_metadata?.role === 'admin' || u.role === 'admin') ? 'rgba(0, 45, 82, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: (u.user_metadata?.role === 'admin' || u.role === 'admin') ? 'var(--aerum-navy)' : 'var(--aerum-gray-medium)',
                      }}>
                        {(u.user_metadata?.role || u.role || 'user').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '20px', color: 'var(--aerum-gray-medium)', fontSize: '0.85rem' }}>
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Nunca'}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteUser(u.id, u.user_metadata?.full_name || u.email)}
                        style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '8px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Crear Usuario */}
      <AnimatePresence>
        {showModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0, 45, 82, 0.4)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="luxury-card"
              style={{ width: '90%', maxWidth: '480px', borderTop: '6px solid var(--aerum-gold)' }}
            >
              <h2 style={{ marginBottom: '28px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>
                Alta de Nuevo Usuario
              </h2>
              <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>NOMBRE COMPLETO</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Alejandro Silva"
                      style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid var(--aerum-border)', borderRadius: '8px' }}
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>CORREO ELECTRÓNICO</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                    <input 
                      type="email" 
                      required
                      placeholder="usuario@aerum.com"
                      style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid var(--aerum-border)', borderRadius: '8px' }}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>CONTRASEÑA TEMPORAL</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--aerum-border)', borderRadius: '8px' }}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>ROL ASIGNADO</label>
                  <select 
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--aerum-border)', borderRadius: '8px', background: 'white' }}
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">CLIENTE ESTÁNDAR</option>
                    <option value="admin">ADMINISTRADOR</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', background: 'var(--aerum-gray-light)', color: 'var(--aerum-gray-dark)', fontWeight: '700' }}>CANCELAR</button>
                  <button type="submit" disabled={actionLoading} className="gold-button" style={{ flex: 1.5, padding: '14px' }}>
                    {actionLoading ? 'CREANDO...' : 'REGISTRAR USUARIO'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
