import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { transactionService } from '../services/api';

const AdminDashboard = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await transactionService.getAllTransactions();
        setAllTransactions(res.data);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

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
      <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aerum-gray-light)' }}>
      <div className="be-top-bar" />
      
      <header className="be-header-container">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/dashboard" style={{ color: 'var(--aerum-navy)', background: 'var(--aerum-gray-light)', padding: '8px', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={24} /></Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck color="var(--aerum-gold)" size={32} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--aerum-navy)', letterSpacing: '-0.02em' }}>
                ADMIN<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
              </h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--aerum-gold)', fontWeight: '800', letterSpacing: '0.05em' }}>MÓDULO DE AUDITORÍA</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--aerum-navy)' }}>{user?.user_metadata?.full_name || 'Personal Logístico'}</p>
            </div>
            <button onClick={handleLogout} style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px' }}>
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 20px' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px' }}>
            <div style={{ padding: '16px', background: 'rgba(0, 45, 82, 0.05)', borderRadius: '16px' }}>
              <Activity color="var(--aerum-navy)" size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>MOVIMIENTOS GLOBALES</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{allTransactions.length}</h3>
            </div>
          </div>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px' }}>
            <div style={{ padding: '16px', background: 'rgba(225, 161, 26, 0.1)', borderRadius: '16px' }}>
              <Users color="var(--aerum-gold)" size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>CLIENTES ACTIVOS</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800' }}>{new Set(allTransactions.map(t => t.account_id)).size}</h3>
            </div>
          </div>
          <Link to="/admin/users" className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '36px', textDecoration: 'none', border: '1px dashed var(--aerum-gold)' }}>
            <div style={{ padding: '16px', background: 'var(--aerum-navy)', borderRadius: '16px' }}>
              <UserPlus color="var(--aerum-gold)" size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>CONTROL TOTAL</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>GESTIÓN DE USUARIOS</h3>
            </div>
          </Link>
        </div>

        {/* Global Activity Table */}
        <div className="luxury-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Libro de Movimientos</h3>
              <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.9rem', fontWeight: '500' }}>Registro histórico de todas las transacciones del ecosistema Aerum.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--aerum-gray-medium)' }} />
                <input 
                  type="text" 
                  placeholder="ID de Cuenta o Glosa..."
                  style={{ padding: '12px 12px 12px 48px', background: '#F9FAFB', border: '1px solid var(--aerum-border)', borderRadius: '10px', width: '300px', fontWeight: '500' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button style={{ background: 'var(--aerum-navy)', color: 'white', padding: '12px 20px', borderRadius: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Filter size={20} />
                <span>FILTRAR</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', color: 'var(--aerum-navy)', fontSize: '0.85rem', fontWeight: '800' }}>
                  <th style={{ padding: '20px' }}>FECHA DE OPERACIÓN</th>
                  <th style={{ padding: '20px' }}>CUENTA ORIGEN</th>
                  <th style={{ padding: '20px' }}>TIPO DE FLUJO</th>
                  <th style={{ padding: '20px' }}>DESCRIPCIÓN</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>MONTO CONSOLIDADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--aerum-border)', fontSize: '0.95rem', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '20px', color: 'var(--aerum-gray-medium)', fontWeight: '500' }}>{new Date(t.created_at).toLocaleString()}</td>
                    <td style={{ padding: '20px', fontWeight: '700', color: 'var(--aerum-navy)', fontFamily: 'monospace' }}>
                      **** **** {t.accounts?.account_number?.slice(-4) || 'N/A'}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ 
                        padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                        background: t.type === 'CREDITO' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 161, 26, 0.1)',
                        color: t.type === 'CREDITO' ? '#059669' : 'var(--aerum-gold)'
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '20px', fontWeight: '500' }}>{t.description}</td>
                    <td style={{ padding: '20px', textAlign: 'right', fontWeight: '800', color: 'var(--aerum-navy)', fontSize: '1.1rem' }}>
                      ${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ color: 'var(--aerum-gray-medium)', fontWeight: '600' }}>No se encontraron registros que coincidan con la búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
