import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { accountService, transactionService } from '../services/api';

const TransferPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Loading, 3: Success
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    account_id: '',
    recipient_account_number: '',
    amount: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await accountService.getAccounts();
        setAccounts(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, account_id: res.data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setStep(2);
    setError('');
    
    try {
      await transactionService.transfer({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la transferencia');
      setStep(1);
    }
  };

  if (step === 3) {
    return (
      <div className="fade-in" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <CheckCircle2 size={100} color="var(--electric-blue)" />
        </motion.div>
        <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>¡Transferencia Exitosa!</h2>
        <p style={{ color: 'var(--gray-mid)', marginTop: '0.5rem' }}>El dinero ha sido enviado correctamente.</p>
        <button 
          onClick={() => navigate('/')}
          className="premium-card" 
          style={{ marginTop: '3rem', width: '100%', padding: '1rem', border: 'none' }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '1.5rem', paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'white' }}><ArrowLeft size={24} /></Link>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '600' }}>Nueva Transferencia</h2>
      </header>

      <form onSubmit={handleTransfer}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gray-mid)', fontSize: '0.9rem' }}>Desde mi cuenta</label>
          <select 
            className="card"
            style={{ width: '100%', background: 'var(--navy-light)', color: 'white', fontSize: '1rem' }}
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            required
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.account_number} - ${acc.balance.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gray-mid)', fontSize: '0.9rem' }}>Número de cuenta destino</label>
          <input 
            className="card"
            type="text"
            placeholder="0000000000"
            style={{ width: '100%', background: 'var(--navy-light)', color: 'white', fontSize: '1rem' }}
            value={formData.recipient_account_number}
            onChange={(e) => setFormData({ ...formData, recipient_account_number: e.target.value })}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gray-mid)', fontSize: '0.9rem' }}>Monto a transferir</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', fontSize: '1.2rem' }}>$</span>
            <input 
              className="card"
              type="number"
              placeholder="0.00"
              style={{ width: '100%', background: 'var(--navy-light)', color: 'white', fontSize: '1.5rem', paddingLeft: '2.5rem', fontWeight: '700' }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gray-mid)', fontSize: '0.9rem' }}>Motivo (Opcional)</label>
          <input 
            className="card"
            type="text"
            placeholder="Ej: Pago de cena"
            style={{ width: '100%', background: 'var(--navy-light)', color: 'white', fontSize: '1rem' }}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff453a', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 69, 58, 0.1)', borderRadius: '12px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={step === 2}
          className="premium-card" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '600' }}
        >
          {step === 2 ? 'Procesando...' : (
            <>
              <Send size={20} />
              Enviar Dinero
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransferPage;
