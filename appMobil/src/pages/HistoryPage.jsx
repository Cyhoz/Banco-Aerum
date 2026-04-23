import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { accountService, transactionService } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accRes = await accountService.getAccounts();
        if (accRes.data.length > 0) {
          const histRes = await transactionService.getHistory(accRes.data[0].id);
          setHistory(histRes.data);
        }
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredHistory = history.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount.toString().includes(searchTerm)
  );

  return (
    <div className="fade-in" style={{ padding: '1.5rem', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Actividad</h2>
        <p style={{ color: 'var(--gray-mid)', fontSize: '0.9rem' }}>Historial completo de tus movimientos</p>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-mid)' }} />
          <input 
            className="card"
            placeholder="Buscar transacciones..."
            style={{ width: '100%', background: 'var(--navy-light)', paddingLeft: '2.5rem', color: 'white' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="card" style={{ background: 'var(--navy-light)', padding: '0.75rem' }}>
          <Filter size={20} />
        </button>
      </div>

      <div className="transaction-list">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando movimientos...</p>
        ) : filteredHistory.length > 0 ? filteredHistory.map((tx, idx) => (
          <motion.div 
            key={tx.id} 
            className="card" 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '0.75rem', background: 'var(--navy-light)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div style={{ 
              background: tx.type === 'CREDITO' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 69, 58, 0.1)', 
              color: tx.type === 'CREDITO' ? '#00ff7f' : '#ff453a',
              padding: '10px', 
              borderRadius: '12px' 
            }}>
              {tx.type === 'CREDITO' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{tx.description}</p>
              <p style={{ color: 'var(--gray-mid)', fontSize: '0.8rem' }}>
                {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', color: tx.type === 'CREDITO' ? '#00ff7f' : '#fff' }}>
                {tx.type === 'CREDITO' ? '+' : '-'}${tx.amount.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--gray-mid)' }}>{tx.type}</p>
            </div>
          </motion.div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--gray-mid)' }}>No se encontraron movimientos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
