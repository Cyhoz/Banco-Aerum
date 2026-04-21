import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut
} from 'lucide-react';
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
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-obsidian)' }}>
      <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-obsidian)', color: 'white', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck color="var(--gold-primary)" size={32} />
          <h2 className="gold-gradient-text" style={{ fontSize: '1.8rem' }}>AUREUM ADMIN</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--gold-light)' }}>Panel de Control Escalonado</p>
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>Admin: {user?.name || 'Gestor'}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}>
            <LogOut size={20} color="#ff6b6b" />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px' }}>
              <Activity color="var(--gold-primary)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>TOTAL TRANSACCIONES</p>
              <h3>{allTransactions.length}</h3>
            </div>
          </div>
          <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(229, 228, 226, 0.1)', borderRadius: '12px' }}>
              <Users color="var(--platinum)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>USUARIOS ACTIVOS</p>
              <h3>{new Set(allTransactions.map(t => t.account_id)).size}</h3>
            </div>
          </div>
        </div>

        {/* Global Activity Table */}
        <div className="luxury-card" style={{ minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <h3>AUDITORÍA GLOBAL DE TRANSACCIONES</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por cuenta o Ref..."
                  style={{ padding: '10px 10px 10px 40px', background: 'var(--bg-onyx)', border: '1px solid var(--border-platinum)', borderRadius: '8px', color: 'white' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button style={{ background: 'var(--bg-onyx)', border: '1px solid var(--border-platinum)', padding: '10px', borderRadius: '8px' }}>
                <Filter size={18} color="var(--gold-primary)" />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--gold-light)', fontSize: '0.8rem', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-platinum)' }}>
                  <th style={{ padding: '16px' }}>FECHA</th>
                  <th style={{ padding: '16px' }}>CUENTA ORIGEN</th>
                  <th style={{ padding: '16px' }}>TIPO</th>
                  <th style={{ padding: '16px' }}>DESCRIPCIÓN</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>MONTO</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <motion.tr 
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}
                  >
                    <td style={{ padding: '16px', color: 'var(--text-gray)' }}>{new Date(t.created_at).toLocaleString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontFamily: 'monospace' }}>****{t.accounts?.account_number?.slice(-4) || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                        background: t.type === 'CREDITO' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        color: t.type === 'CREDITO' ? '#4caf50' : 'var(--gold-primary)'
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{t.description}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${t.amount.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '40px' }}>No se encontraron registros.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
