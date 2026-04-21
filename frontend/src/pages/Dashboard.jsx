import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Plus, 
  Send, 
  User as UserIcon,
  TrendingUp,
  History,
  ShieldCheck
} from 'lucide-react';
import { accountService, transactionService, authService } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpModal, setShowOpModal] = useState(false);
  const [opType, setOpType] = useState('DEPOSIT'); // 'DEPOSIT' or 'TRANSFER'
  const [formData, setFormData] = useState({ amount: '', recipientAccount: '', description: '' });

  const fetchData = async () => {
    try {
      // Por simplicidad, asumimos que el usuario solo tiene una cuenta
      const accRes = await accountService.getAccounts();
      if (accRes.data && accRes.data.length > 0) {
        const myAcc = accRes.data[0];
        setAccount(myAcc);
        const transRes = await transactionService.getTransactions(myAcc.id);
        setTransactions(transRes.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleOperation = async (e) => {
    e.preventDefault();
    try {
      await transactionService.createTransaction({
        account_id: account.id,
        amount: parseFloat(formData.amount),
        type: opType === 'DEPOSIT' ? 'CREDITO' : 'TRANSFERENCIA',
        description: formData.description || (opType === 'DEPOSIT' ? 'Depósito Personal' : `Transferencia a ${formData.recipientAccount}`)
      });
      setShowOpModal(false);
      setFormData({ amount: '', recipientAccount: '', description: '' });
      fetchData(); // Recargar datos
    } catch (err) {
      alert("Error al procesar la operación");
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-obsidian)' }}>
      <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--bg-obsidian)', color: 'white', padding: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck color="var(--gold-primary)" size={32} />
          <h2 className="gold-gradient-text" style={{ fontSize: '1.8rem' }}>AUREUM</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Bienvenido,</p>
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>{user?.name || 'Cliente Distinguido'}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}>
            <LogOut size={20} color="#ff6b6b" />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          
          {/* Card Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="platinum-card luxury-card" 
            style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>SALDO DISPONIBLE</p>
                <CreditCard color="var(--platinum)" opacity={0.5} />
              </div>
              <h1 style={{ fontSize: '3rem', marginTop: '10px' }}>
                <span style={{ color: 'var(--gold-primary)', marginRight: '8px' }}>$</span>
                {account?.balance?.toLocaleString() || '0.00'}
              </h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', letterSpacing: '0.2em' }}>NUMERO DE CUENTA</p>
                <p style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>**** **** **** {account?.account_number?.slice(-4) || '8888'}</p>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="logo" style={{ width: '40px', opacity: 0.8 }} />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="luxury-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h3 style={{ borderBottom: '1px solid var(--border-platinum)', paddingBottom: '12px', marginBottom: '8px' }}>OPERACIONES RÁPIDAS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button 
                onClick={() => { setOpType('DEPOSIT'); setShowOpModal(true); }}
                className="gold-button" 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px' }}
              >
                <Plus size={24} />
                <span style={{ fontSize: '0.8rem' }}>DEPOSITAR</span>
              </button>
              <button 
                onClick={() => { setOpType('TRANSFER'); setShowOpModal(true); }}
                className="luxury-card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', background: 'rgba(255,255,255,0.05)' }}
              >
                <Send size={24} color="var(--gold-primary)" />
                <span style={{ fontSize: '0.8rem', color: 'white' }}>TRANSFERIR</span>
              </button>
            </div>
            <div className="luxury-card" style={{ flex: 1, background: 'rgba(212, 175, 55, 0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <TrendingUp color="var(--gold-primary)" />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Rendimiento Mensual</p>
                <p style={{ fontWeight: 'bold' }}>+ 4.25% APY</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transactions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card" 
          style={{ minHeight: '400px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History color="var(--gold-primary)" size={20} />
              <h3>ACTIVIDAD RECIENTE</h3>
            </div>
            <button style={{ color: 'var(--gold-light)', fontSize: '0.9rem', background: 'none' }}>Ver todo</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.length > 0 ? transactions.map((t, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.02)',
                borderLeft: `4px solid ${t.type === 'CREDITO' ? '#4caf50' : '#f44336'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: t.type === 'CREDITO' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.type === 'CREDITO' ? <ArrowDownLeft color="#4caf50" size={20} /> : <ArrowUpRight color="#f44336" size={20} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600' }}>{t.description || 'Transacción Aureum'}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    color: t.type === 'CREDITO' ? '#4caf50' : '#f44336'
                  }}>
                    {t.type === 'CREDITO' ? '+' : '-'}${t.amount.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>COMPLETADO</p>
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '40px' }}>No hay transacciones aún.</p>
            )}
          </div>
        </motion.div>
      </main>

      {/* Modal for Operations */}
      <AnimatePresence>
        {showOpModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="luxury-card"
              style={{ width: '90%', maxWidth: '400px' }}
            >
              <h2 className="gold-gradient-text" style={{ marginBottom: '24px' }}>
                {opType === 'DEPOSIT' ? 'REALIZAR DEPÓSITO' : 'NUEVA TRANSFERENCIA'}
              </h2>
              <form onSubmit={handleOperation}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>CANTIDAD</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    required
                    style={{ width: '100%', padding: '12px', background: 'var(--bg-obsidian)', border: '1px solid var(--border-platinum)', borderRadius: '8px', color: 'white' }}
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                
                {opType === 'TRANSFER' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>CUENTA DESTINO</label>
                    <input 
                      type="text" 
                      placeholder="Número de cuenta"
                      required
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-obsidian)', border: '1px solid var(--border-platinum)', borderRadius: '8px', color: 'white' }}
                      value={formData.recipientAccount}
                      onChange={(e) => setFormData({...formData, recipientAccount: e.target.value})}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>DESCRIPCIÓN (OPCIONAL)</label>
                  <input 
                    type="text" 
                    placeholder="Ref. Pago"
                    style={{ width: '100%', padding: '12px', background: 'var(--bg-obsidian)', border: '1px solid var(--border-platinum)', borderRadius: '8px', color: 'white' }}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setShowOpModal(false)} className="luxury-card" style={{ flex: 1, padding: '12px', background: 'none', color: 'var(--text-gray)' }}>CANCELAR</button>
                  <button type="submit" className="gold-button" style={{ flex: 2 }}>{opType === 'DEPOSIT' ? 'CONFIRMAR DEPÓSITO' : 'ENVIAR FONDOS'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
