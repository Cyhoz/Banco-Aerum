import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Plus, 
  Send, 
  History, 
  ShieldCheck,
  Eye,
  EyeOff,
  Settings,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountService, transactionService, interbankService } from '../services/api';
import { Globe, Building } from 'lucide-react';

const Dashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpModal, setShowOpModal] = useState(false);
  const [opType, setOpType] = useState('DEPOSIT'); 
  const [formData, setFormData] = useState({ amount: '', recipientAccount: '', description: '' });
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [banks, setBanks] = useState([{ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false }]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [customAlert, setCustomAlert] = useState({ show: false, message: '', type: 'success' });


  const fetchData = async () => {
    try {
      console.log('--- FETCHING DATA IN DASHBOARD ---');
      const accRes = await accountService.getAccounts();
      console.log('--- API RESPONSE RECEIVED ---', accRes.data);
      
      if (accRes.data && accRes.data.length > 0) {
        const myAcc = accRes.data[0];
        console.log('--- SETTING ACCOUNT ---', myAcc);
        setAccount({...myAcc}); 
        
        const transRes = await transactionService.getTransactions(myAcc.id);
        setTransactions(transRes.data || []);
      } else {
        console.warn('--- NO ACCOUNTS FOUND IN RESPONSE ---');
      }

      // Cargar bancos externos
      try {
        const banksRes = await interbankService.listBanks();
        if (banksRes.data) {
          const formatted = banksRes.data.map(b => ({ ...b, is_external: true }));
          setBanks([{ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false }, ...formatted]);
        }
      } catch (e) { console.error("Error al cargar bancos", e); }
      
      setSelectedBank({ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false });

    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (customAlert.show) {
      const timer = setTimeout(() => {
        setCustomAlert(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [customAlert.show]);

  const handleLogout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const handleOperation = async (e) => {
    e.preventDefault();
    if (!account) return;
    
    // Para transferencias sí necesitamos un banco seleccionado, para depósitos no
    if (opType === 'TRANSFER' && !selectedBank) {
      alert("Por favor seleccione una institución");
      return;
    }

    // Capturar metadatos forenses
    const getAuditMetadata = async () => {
      const ua = navigator.userAgent;
      let browser = "Desconocido";
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";

      let device = "PC / Desktop";
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        device = "Móvil / Tablet";
      }

      let location = "Privada / No permitida";
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        location = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      } catch (e) {
        console.warn("Geolocalización no disponible", e.message);
      }

      return { browser, device, location };
    };

    try {
      const audit = await getAuditMetadata();

      if (opType === 'TRANSFER' && selectedBank?.is_external) {
        // --- LOGICA INTERBANCARIA (EXTERNA) ---
        const cleanUrl = selectedBank.api_url.endsWith('/') ? selectedBank.api_url.slice(0, -1) : selectedBank.api_url;
        
        await transactionService.createTransaction({
          account_id: account.id,
          amount: parseFloat(formData.amount),
          type: 'TRANSFERENCIA',
          recipient_account_number: formData.recipientAccount,
          external_url: cleanUrl,
          description: `[Interbancario a ${selectedBank.name}] ${formData.description || ''}`,
          ...audit
        });
      } else {
        // --- LOGICA INTERNA (DEPÓSITOS Y TRANSFERENCIAS AERUM) ---
        await transactionService.createTransaction({
          account_id: account.id,
          amount: parseFloat(formData.amount),
          type: opType === 'DEPOSIT' ? 'CREDITO' : 'TRANSFERENCIA',
          recipient_account_number: opType === 'TRANSFER' ? formData.recipientAccount : null,
          description: formData.description || (opType === 'DEPOSIT' ? 'Depósito en Efectivo' : `Envío a ${formData.recipientAccount}`),
          ...audit
        });
      }

      setShowOpModal(false);
      setFormData({ amount: '', recipientAccount: '', description: '' });
      fetchData();
      setCustomAlert({ show: true, message: "Operación realizada con éxito", type: 'success' });
    } catch (err) {
      setCustomAlert({ show: true, message: err.response?.data?.error || "Error en la operación", type: 'error' });
    }

  };

  // Removemos el bloqueo total de carga para que la UI siempre se vea

  return (
    <div style={{ minHeight: '100vh', background: 'var(--aerum-gray-light)' }}>
      <div className="be-top-bar" />


      {/* Alerta Personalizada Premium */}
      <AnimatePresence>
        {customAlert.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              width: '90%',
              maxWidth: '400px'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              border: `2px solid ${customAlert.type === 'success' ? 'var(--aerum-gold)' : '#ff4d4d'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: customAlert.type === 'success' ? 'var(--aerum-gold)' : '#ff4d4d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {customAlert.type === 'success' ? <ShieldCheck size={24} /> : <EyeOff size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '700', color: 'var(--aerum-navy)', margin: 0 }}>
                  {customAlert.type === 'success' ? 'ÉXITO' : 'ERROR'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{customAlert.message}</p>
              </div>
              <button 
                onClick={() => setCustomAlert({ ...customAlert, show: false })}
                style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}
              >
                <Plus style={{ transform: 'rotate(45deg)' }} size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* Header */}
      <header className="be-header-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Menu size={24} color="var(--aerum-navy)" style={{ marginRight: '16px' }} />
            <ShieldCheck color="var(--aerum-gold)" size={32} />
            <h1 style={{ fontSize: '1.6rem', marginLeft: '10px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--aerum-navy)' }}>
              BANCO<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
            </h1>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--aerum-gray-medium)', fontWeight: '700' }}>CLIENTE AERUM</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--aerum-navy)' }}>
                {user?.user_metadata?.full_name || user?.name || 'Titular'}
              </p>
            </div>
            
            {(user?.user_metadata?.role === 'admin' || user?.role === 'admin') && (
              <Link to="/admin" className="gold-button" style={{ fontSize: '0.75rem', padding: '10px 16px' }}>
                AUDITORÍA
              </Link>
            )}
            
            <button onClick={handleLogout} style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>CERRAR SESIÓN</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Bienvenido'}</h2>
          <p style={{ color: 'var(--aerum-gray-medium)', fontWeight: '500' }}>Aquí tienes el resumen consolidado de tus finanzas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          
          {/* Main Account Card */}
          <div className="platinum-card luxury-card" style={{ padding: '36px', borderLeftWidth: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <p style={{ color: 'var(--aerum-gray-medium)', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em' }}>SALDO TOTAL DISPONIBLE</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                   <p style={{ fontSize: '0.9rem', color: 'var(--aerum-navy)', fontFamily: 'monospace', fontWeight: '700' }}>
                    {account ? (showAccountNumber ? account.account_number : `**** **** ${account.account_number?.slice(-4)}`) : 'Cargando...'}
                   </p>
                   <button onClick={() => setShowAccountNumber(!showAccountNumber)} style={{ background: 'none', color: 'var(--aerum-gold)' }}>
                    {showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                   </button>
                </div>
              </div>
              <div style={{ background: 'var(--aerum-gray-light)', padding: '12px', borderRadius: '12px' }}>
                <CreditCard color="var(--aerum-navy)" size={32} />
              </div>
            </div>
            

             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <h1 style={{ 
                 fontSize: '3.5rem', 
                 color: account?.balance > 0 ? 'var(--aerum-gold)' : 'var(--aerum-navy)', 
                 display: 'flex', 
                 alignItems: 'baseline', 
                 fontWeight: 'bold',
                 margin: 0
               }}>
                 <span style={{ fontSize: '1.5rem', marginRight: '6px', color: 'var(--aerum-gold)' }}>$</span>
                 {account ? (account.balance?.toLocaleString() || '0') : '...'}
               </h1>
               <button 
                 onClick={fetchData} 
                 style={{ 
                   background: 'none', 
                   border: 'none', 
                   color: 'var(--aerum-gold)', 
                   cursor: 'pointer',
                   padding: '5px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.3s'
                 }}
                 title="Actualizar saldo"
                 className="refresh-button-hover"
               >
                 <Plus style={{ transform: 'rotate(45deg)' }} size={24} />
               </button>
             </div>


            
            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => { setOpType('DEPOSIT'); setShowOpModal(true); }}
                className="gold-button"
                style={{ flex: 1 }}
              >
                INGRESAR DINERO
              </button>
              <button 
                onClick={() => { setOpType('TRANSFER'); setShowOpModal(true); }}
                style={{ flex: 1, background: 'var(--aerum-navy)', color: 'white', fontWeight: '700' }}
              >
                TRANSFERIR
              </button>
            </div>
          </div>

          {/* Side Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="luxury-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(225, 161, 26, 0.1)', padding: '12px', borderRadius: '12px' }}>
                   <History color="var(--aerum-gold)" size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--aerum-gray-medium)', fontWeight: '700' }}>PUNTOS AERUM</p>
                  <p style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--aerum-navy)' }}>12,840 <span style={{ fontSize: '0.9rem', color: 'var(--aerum-gold)' }}>pts</span></p>
                </div>
              </div>
              <ChevronRight color="var(--aerum-border)" />
            </div>
            <div className="luxury-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(0, 45, 82, 0.05)', padding: '12px', borderRadius: '12px' }}>
                   <ShieldCheck color="var(--aerum-navy)" size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--aerum-gray-medium)', fontWeight: '700' }}>PROTECCIÓN ACTIVA</p>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--aerum-navy)' }}>Ciberseguridad 24/7</p>
                </div>
              </div>
              <div style={{ background: '#10B981', width: '10px', height: '10px', borderRadius: '50%' }} />
            </div>
          </div>
        </div>

        {/* Transactions Table Style */}
        <div className="luxury-card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <History color="var(--aerum-navy)" size={28} />
              <h3 style={{ fontSize: '1.4rem', color: 'var(--aerum-navy)', fontWeight: '800' }}>Actividad de Cuenta</h3>
            </div>
            <button style={{ color: 'var(--aerum-blue-light)', fontWeight: '700', fontSize: '0.9rem', background: 'none' }}>Descargar Cartola</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.length > 0 ? transactions.map((t, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '24px 0', 
                borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid var(--aerum-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ 
                     width: '48px', 
                     height: '48px', 
                     borderRadius: '12px',
                     background: t.type === 'CREDITO' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.05)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: t.type === 'CREDITO' ? '#059669' : '#4B5563'
                   }}>
                    {t.type === 'CREDITO' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                   </div>
                   <div>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--aerum-navy)' }}>{t.description}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--aerum-gray-medium)', fontWeight: '500' }}>{new Date(t.created_at).toLocaleDateString()} • {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    fontWeight: '800', 
                    fontSize: '1.2rem',
                    color: t.type === 'CREDITO' ? '#059669' : 'var(--aerum-navy)'
                  }}>
                    {t.type === 'CREDITO' ? '+' : '-'}${t.amount.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--aerum-gray-medium)', fontWeight: '700' }}>CONFIRMADO</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ background: 'var(--aerum-gray-light)', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={30} color="var(--aerum-border)" />
                </div>
                <p style={{ color: 'var(--aerum-gray-medium)', fontWeight: '600' }}>No se registran movimientos en el periodo.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Operation Modal */}
      <AnimatePresence>
        {showOpModal && (
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
              style={{ width: '90%', maxWidth: '440px', borderTop: '6px solid var(--aerum-navy)' }}
            >
              <h2 style={{ marginBottom: '28px', fontSize: '1.5rem', fontWeight: '800' }}>
                {opType === 'DEPOSIT' ? 'Confirmar Depósito' : 'Nueva Transferencia'}
              </h2>
              <form onSubmit={handleOperation}>
                {opType === 'TRANSFER' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>
                      SELECCIONAR INSTITUCIÓN DESTINO
                    </label>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                      {banks.map(bank => (
                        <div 
                          key={bank.id} 
                          onClick={() => setSelectedBank(bank)}
                          style={{ 
                            flex: '0 0 auto', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: selectedBank?.id === bank.id ? 'var(--aerum-gold)' : 'var(--aerum-gray-light)',
                            color: selectedBank?.id === bank.id ? 'var(--aerum-navy)' : 'var(--aerum-gray-medium)',
                            border: `2px solid ${selectedBank?.id === bank.id ? 'var(--aerum-gold)' : 'transparent'}`,
                            transition: 'all 0.2s ease', fontWeight: '700', fontSize: '0.9rem'
                          }}
                        >
                          {bank.is_external ? <Globe size={16} /> : <Building size={16} />}
                          {bank.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>MONTO A TRANSACCIONAR</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: 'var(--aerum-gold)' }}>$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 30px', border: '1px solid var(--aerum-border)', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700' }}
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                
                {opType === 'TRANSFER' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>CUENTA DE DESTINO</label>
                    <input 
                      type="text" 
                      placeholder="99-XXXX-XXXX"
                      required
                      style={{ width: '100%', padding: '14px', border: '1px solid var(--aerum-border)', borderRadius: '8px' }}
                      value={formData.recipientAccount}
                      onChange={(e) => setFormData({...formData, recipientAccount: e.target.value})}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--aerum-gray-medium)' }}>COMENTARIO ADICIONAL</label>
                  <input 
                    type="text" 
                    placeholder="Referencia o motivo"
                    style={{ width: '100%', padding: '14px', border: '1px solid var(--aerum-border)', borderRadius: '8px' }}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setShowOpModal(false)} style={{ flex: 1, padding: '14px', background: 'var(--aerum-gray-light)', color: 'var(--aerum-gray-dark)', fontWeight: '700' }}>ANULAR</button>
                  <button type="submit" className="gold-button" style={{ flex: 1.5, padding: '14px' }}>
                    {opType === 'DEPOSIT' ? 'CONFIRMAR DEPÓSITO' : 'EJECUTAR TRANSFERENCIA'}
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

export default Dashboard;
