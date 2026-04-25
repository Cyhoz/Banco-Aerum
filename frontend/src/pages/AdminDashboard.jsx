import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus,
  Activity, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  ChevronLeft,
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Fingerprint,
  CreditCard,
  History,
  X,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { transactionService, adminService } from '../services/api';

const AdminDashboard = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [usersSummary, setUsersSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [transRes, usersRes] = await Promise.all([
        transactionService.getAllTransactions(),
        adminService.getUsersSummary()
      ]);
      setAllTransactions(transRes.data);
      setUsersSummary(usersRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAuditUser = async (userId) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const res = await adminService.getUserDetail(userId);
      setSelectedUserDetail(res.data);
    } catch (err) {
      console.error("Error al obtener detalle", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const filteredTransactions = allTransactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accounts?.account_number?.includes(searchTerm)
  );

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--aerum-gray-light)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
        <p style={{ fontWeight: '800', color: 'var(--aerum-navy)', letterSpacing: '0.1em' }}>INICIANDO CONSOLA DE AUDITORÍA...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aerum-gray-light)' }}>
      <div className="be-top-bar" />
      
      <header className="be-header-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/dashboard" style={{ color: 'var(--aerum-navy)', background: 'var(--aerum-gray-light)', padding: '8px', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={24} /></Link>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <ShieldCheck color="var(--aerum-gold)" size={32} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--aerum-navy)', letterSpacing: '-0.02em', margin: 0 }}>
                ADMIN<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
              </h2>
            </Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--aerum-gold)', fontWeight: '800', letterSpacing: '0.05em' }}>CENTRAL DE INTELIGENCIA</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--aerum-navy)' }}>{user?.user_metadata?.full_name || 'Personal Logístico'}</p>
            </div>
            <button onClick={handleLogout} style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px' }}>
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '48px auto', padding: '0 20px' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px' }}>
            <div style={{ padding: '16px', background: 'rgba(0, 45, 82, 0.05)', borderRadius: '16px' }}>
              <Activity color="var(--aerum-navy)" size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>TRANSACCIONES TOTALES</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{allTransactions.length}</h3>
            </div>
          </div>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px' }}>
            <div style={{ padding: '16px', background: 'rgba(225, 161, 26, 0.1)', borderRadius: '16px' }}>
              <Users color="var(--aerum-gold)" size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>CARTERA DE CLIENTES</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{usersSummary.length}</h3>
            </div>
          </div>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px', background: 'var(--aerum-navy)' }}>
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
              <CreditCard color="var(--aerum-gold)" size={28} />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>CAPITAL TOTAL CUSTODIADO</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white' }}>
                ${usersSummary.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString('es-CL')}
              </h3>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="luxury-card" style={{ padding: '40px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Gestión de Clientes</h3>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.9rem', fontWeight: '500' }}>Listado maestro de usuarios y saldos actuales.</p>
            </div>
            <Link to="/admin/users" className="gold-button" style={{ padding: '12px 24px', fontSize: '0.85rem' }}>
              <UserPlus size={18} /> GESTIONAR USUARIOS
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', color: 'var(--aerum-navy)', fontSize: '0.85rem', fontWeight: '800' }}>
                  <th style={{ padding: '20px' }}>CLIENTE</th>
                  <th style={{ padding: '20px' }}>NÚMERO DE CUENTA</th>
                  <th style={{ padding: '20px' }}>ÚLTIMO ACCESO</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>SALDO DISPONIBLE</th>
                  <th style={{ padding: '20px', textAlign: 'center' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {usersSummary.map((u, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--aerum-border)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '800', color: 'var(--aerum-navy)' }}>{u.full_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--aerum-gray-medium)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px', fontFamily: 'monospace', fontWeight: '700' }}>{u.account_number}</td>
                    <td style={{ padding: '20px', color: 'var(--aerum-gray-medium)' }}>
                      {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString('es-CL') : 'Nunca'}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800', color: 'var(--aerum-gold)' }}>
                      ${u.balance?.toLocaleString('es-CL')} CLP
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleAuditUser(u.id)}
                        style={{ padding: '8px 16px', background: 'var(--aerum-navy)', color: 'white', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        AUDITAR MOVIMIENTOS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Activity Table */}
        <div className="luxury-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Libro de Movimientos Global</h3>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.9rem', fontWeight: '500' }}>Registro histórico de todas las transacciones.</p>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
              <input 
                type="text" 
                placeholder="Buscar por cuenta o glosa..."
                style={{ padding: '12px 12px 12px 48px', background: '#F9FAFB', border: '1px solid var(--aerum-border)', borderRadius: '10px', width: '300px', fontWeight: '500' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', color: 'var(--aerum-navy)', fontSize: '0.85rem', fontWeight: '800' }}>
                  <th style={{ padding: '20px' }}>FECHA</th>
                  <th style={{ padding: '20px' }}>CUENTA</th>
                  <th style={{ padding: '20px' }}>FORENSE</th>
                  <th style={{ padding: '20px' }}>UBICACIÓN</th>
                  <th style={{ padding: '20px' }}>DESCRIPCIÓN</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>MONTO</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 50).map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--aerum-border)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '20px' }}>{new Date(t.created_at).toLocaleString('es-CL')}</td>
                    <td style={{ padding: '20px', fontWeight: '700' }}>{t.accounts?.account_number}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Globe size={14} title={t.browser} />
                        {t.device?.includes('Móvil') ? <Smartphone size={14} /> : <Monitor size={14} />}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {t.location && t.location.includes(',') ? (
                        <a href={`https://www.google.com/maps?q=${t.location}`} target="_blank" style={{ color: 'var(--aerum-gold)', textDecoration: 'none', fontWeight: '700' }}>GPS LINK</a>
                      ) : '---'}
                    </td>
                    <td style={{ padding: '20px' }}>{t.description}</td>
                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800' }}>
                      ${t.amount.toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0, 45, 82, 0.6)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="luxury-card"
              style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}
            >
              {loadingDetail ? (
                <div style={{ padding: '100px', textAlign: 'center' }}>
                  <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px' }}></div>
                  <p style={{ fontWeight: '800', color: 'var(--aerum-navy)' }}>ACCEDIENDO A ARCHIVOS BANCARIOS...</p>
                </div>
              ) : selectedUserDetail && (
                <>
                  <div style={{ background: 'var(--aerum-navy)', padding: '40px', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ background: 'var(--aerum-gold)', color: 'var(--aerum-navy)', padding: '8px', borderRadius: '8px' }}>
                            <ShieldCheck size={24} />
                          </div>
                          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>EXPEDIENTE DEL CLIENTE</h2>
                        </div>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>{selectedUserDetail.user.full_name}</p>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{selectedUserDetail.user.email} • ID: {selectedUserDetail.user.id.slice(0,13)}</p>
                      </div>
                      <button 
                        onClick={() => setShowDetailModal(false)}
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                      <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', border: '1px solid var(--aerum-border)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--aerum-gray-medium)', marginBottom: '12px' }}>SALDO EN CUSTODIA</p>
                        <h4 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--aerum-gold)', margin: 0 }}>
                          ${selectedUserDetail.account?.balance?.toLocaleString('es-CL')} <span style={{ fontSize: '0.9rem' }}>CLP</span>
                        </h4>
                      </div>
                      <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', border: '1px solid var(--aerum-border)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--aerum-gray-medium)', marginBottom: '12px' }}>NÚMERO DE TARJETA / CUENTA</p>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--aerum-navy)', margin: 0 }}>
                          {selectedUserDetail.account?.account_number}
                        </h4>
                      </div>
                      <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', border: '1px solid var(--aerum-border)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--aerum-gray-medium)', marginBottom: '12px' }}>ÚLTIMA CONEXIÓN</p>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--aerum-navy)', margin: 0 }}>
                          {selectedUserDetail.user.last_login ? new Date(selectedUserDetail.user.last_login).toLocaleString('es-CL') : 'Sin registros'}
                        </h4>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--aerum-navy)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <History size={24} color="var(--aerum-gold)" />
                      AUDITORÍA DE MOVIMIENTOS RECIENTES
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.75rem', fontWeight: '800', borderBottom: '2px solid var(--aerum-border)' }}>
                            <th style={{ padding: '12px 0' }}>FECHA</th>
                            <th style={{ padding: '12px 0' }}>TIPO</th>
                            <th style={{ padding: '12px 0' }}>SISTEMA / DISP.</th>
                            <th style={{ padding: '12px 0' }}>UBICACIÓN</th>
                            <th style={{ padding: '12px 0' }}>DESCRIPCIÓN</th>
                            <th style={{ padding: '12px 0', textAlign: 'right' }}>MONTO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUserDetail.transactions.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                              <td style={{ padding: '16px 0' }}>{new Date(t.created_at).toLocaleDateString('es-CL')}</td>
                              <td style={{ padding: '16px 0' }}>
                                <span style={{ 
                                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800',
                                  background: t.type === 'CREDITO' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 161, 26, 0.1)',
                                  color: t.type === 'CREDITO' ? '#059669' : 'var(--aerum-gold)'
                                }}>{t.type}</span>
                              </td>
                              <td style={{ padding: '16px 0' }}>
                                <div style={{ display: 'flex', gap: '8px', color: 'var(--aerum-navy)' }}>
                                  <Globe size={14} title={t.browser} />
                                  {t.device?.includes('Móvil') ? <Smartphone size={14} /> : <Monitor size={14} />}
                                </div>
                              </td>
                              <td style={{ padding: '16px 0' }}>
                                {t.location && t.location.includes(',') ? (
                                  <a href={`https://www.google.com/maps?q=${t.location}`} target="_blank" style={{ color: '#6366F1' }}><ExternalLink size={14} /></a>
                                ) : '---'}
                              </td>
                              <td style={{ padding: '16px 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
                              <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800' }}>
                                ${t.amount.toLocaleString('es-CL')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedUserDetail.transactions.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--aerum-gray-medium)', fontWeight: '600' }}>El cliente no posee movimientos históricos.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
