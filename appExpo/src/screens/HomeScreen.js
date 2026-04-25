import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { supabase } from '../../supabase';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Bell, LogOut, ShieldCheck, Eye, EyeOff } from 'lucide-react-native';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ user, onLogout, onNavigate }) {
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const fetchData = async () => {
    try {
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (!accounts || accounts.length === 0) {
        console.log('No se encontr cuenta, creando una nueva...');
        const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
        const { data: newAcc, error: createError } = await supabase
          .from('accounts')
          .insert([{ 
            user_id: user.id, 
            account_number: accountNumber, 
            balance: 50.00 
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        setAccount(newAcc);
      } else {
        const mainAccount = accounts[0];
        setAccount(mainAccount);

        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', mainAccount.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (txError) throw txError;
        setHistory(txs);
      }
    } catch (error) {
      console.error("DEBUG FETCH ERROR:", error);
      Alert.alert('Error de Conexión', error.message || 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkLocationPermission = async () => {
    const consent = await AsyncStorage.getItem('location_audit');
    if (consent === null) {
      setShowLocationPrompt(true);
    } else {
      setLocationPermission(consent === 'true');
    }
  };

  useEffect(() => {
    fetchData();
    checkLocationPermission();

    // Suscripción en tiempo real para cambios en la cuenta
    const accountSubscription = supabase
      .channel('accounts_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'accounts', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setAccount(payload.new);
      })
      .subscribe();

    // Suscripción para nuevas transacciones
    const txSubscription = supabase
      .channel('tx_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchData(); // Recargar historial cuando hay una nueva tx
      })
      .subscribe();

    return () => {
      supabase.removeChannel(accountSubscription);
      supabase.removeChannel(txSubscription);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const confirmDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      Alert.alert("Error", "Ingrese un monto válido");
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(depositAmount);
      
      if (!account) throw new Error("No se pudo identificar la cuenta del usuario");

      const { error: txError } = await supabase.from('transactions').insert([{
        account_id: account.id,
        amount: amount,
        description: 'Depósito en Efectivo',
        type: 'CREDITO',
        browser: `App Mobil ${Platform.OS}`,
        device: `${Device.brand} ${Device.modelName}`,
        location: await getLocationAudit()
      }]);
      
      if (txError) throw txError;

      const { error: upError } = await supabase
        .from('accounts')
        .update({ balance: account.balance + amount })
        .eq('id', account.id);
      
      if (upError) throw upError;

      setIsDepositModalVisible(false);
      setDepositAmount('');
      fetchData();
      Alert.alert("Éxito", "Depósito realizado correctamente");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocationAudit = async () => {
    if (!locationPermission) return 'No autorizada';
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return 'Permiso denegado';
      
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`;
    } catch (e) {
      return 'Error GPS';
    }
  };

  const handleLocationConsent = async (agreed) => {
    setLocationPermission(agreed);
    await AsyncStorage.setItem('location_audit', agreed.toString());
    setShowLocationPrompt(false);
    if (agreed) {
      await Location.requestForegroundPermissionsAsync();
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D2FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <ShieldCheck size={20} color="#D4AF37" style={{ marginRight: 6 }} />
              <Text style={styles.userName}>BANCO AERUM</Text>
            </View>
            <Text style={styles.welcomeText}>Hola, {user.user_metadata?.full_name?.split(' ')[0] || 'Cliente'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={onLogout}>
              <LogOut size={22} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>SALDO TOTAL DISPONIBLE</Text>
            <TouchableOpacity onPress={() => setShowSensitive(!showSensitive)}>
              {showSensitive ? <EyeOff size={20} color="#D4AF37" /> : <Eye size={20} color="#D4AF37" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceText}>
            {account ? (showSensitive ? `$ ${account.balance?.toLocaleString('es-CL') || '0'} CLP` : '$ ••••••') : '$ ---'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
            <Text style={styles.accountNumber}>
              {account ? (showSensitive ? (account.account_number || '00000000') : '•••• ••••') : 'Cargando...'}
            </Text>
            <Text style={[styles.accountNumber, { fontSize: 10, opacity: 0.6 }]}>{user.user_metadata?.full_name?.toUpperCase() || 'TITULAR AERUM'}</Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsDepositModalVisible(true)}>
            <View style={styles.actionIconContainer}>
              <Plus size={24} color="black" />
            </View>
            <Text style={styles.actionText}>INGRESAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('transfer')}>
            <View style={styles.actionIconContainer}>
              <ArrowUpRight size={24} color="black" />
            </View>
            <Text style={styles.actionText}>TRANSFERIR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
            <TouchableOpacity onPress={() => onNavigate('history')}>
              <Text style={styles.viewAllText}>Ver Cartola</Text>
            </TouchableOpacity>
          </View>

          {history.length > 0 ? history.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={[styles.txIconContainer, { backgroundColor: tx.type === 'CREDITO' ? 'rgba(0, 255, 127, 0.05)' : 'rgba(255, 255, 255, 0.02)' }]}>
                {tx.type === 'CREDITO' ? (
                  <ArrowDownLeft size={20} color="#00ff7f" />
                ) : (
                  <ArrowUpRight size={20} color="#D4AF37" />
                )}
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDescription}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'CREDITO' ? '#00ff7f' : '#D4AF37' }]}>
                {tx.type === 'CREDITO' ? '+' : '+'}${tx.amount.toLocaleString('es-CL')} CLP
              </Text>
            </View>
          )) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={styles.emptyText}>No hay movimientos en el periodo</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDepositModalVisible}
        onRequestClose={() => setIsDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Ingreso</Text>
            <Text style={styles.modalSubtitle}>Indique el monto a depositar en su cuenta</Text>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={depositAmount}
                onChangeText={setDepositAmount}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => { setIsDepositModalVisible(false); setDepositAmount(''); }}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={confirmDeposit}
              >
                <Text style={styles.confirmButtonText}>EJECUTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin Quick Access if applicable */}
      {(user.user_metadata?.role === 'admin' || user.email.includes('admin')) && (
        <TouchableOpacity style={styles.adminFab} onPress={() => onNavigate('admin')}>
          <ShieldCheck size={20} color="black" />
          <Text style={styles.adminFabText}>MODO AUDITOR</Text>
        </TouchableOpacity>
      )}
      {/* Location Audit Prompt */}
      {showLocationPrompt && (
        <Modal transparent={true} animationType="slide" visible={showLocationPrompt}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: '#D4AF37', borderTopWidth: 5 }]}>
              <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: 15, borderRadius: 50, marginBottom: 15 }}>
                <ShieldCheck size={30} color="#D4AF37" />
              </View>
              <Text style={styles.modalTitle}>Seguridad GPS</Text>
              <Text style={[styles.modalSubtitle, { marginBottom: 25 }]}>
                ¿Desea activar la auditoría de ubicación? Esto protege su cuenta permitiendo rastrear el origen de las transacciones en caso de fraude.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleLocationConsent(false)}>
                  <Text style={styles.cancelButtonText}>NO, GRACIAS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={() => handleLocationConsent(true)}>
                  <Text style={styles.confirmButtonText}>ACTIVAR GPS</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Obsidian
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#D4AF37', // Gold
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 28,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLabel: {
    color: '#D4AF37',
    opacity: 0.6,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  balanceText: {
    color: 'white',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  accountNumber: {
    color: 'white',
    opacity: 0.8,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIconContainer: {
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#D4AF37',
  },
  actionText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  historySection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  viewAllText: {
    color: '#D4AF37',
    fontWeight: '700',
    fontSize: 13,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  txIconContainer: {
    padding: 10,
    borderRadius: 14,
    marginRight: 15,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  txDate: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  txAmount: {
    fontWeight: '900',
    fontSize: 17,
  },
  emptyText: {
    color: '#444',
    textAlign: 'center',
    fontWeight: '600',
  },
  adminFab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  adminFabText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    width: '100%',
    borderRadius: 30,
    padding: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 13,
    marginBottom: 30,
    textAlign: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 25,
    height: 80,
    marginBottom: 35,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  currencyPrefix: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: '800',
    marginRight: 15,
  },
  modalInput: {
    flex: 1,
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
  },
  confirmButton: {
    flex: 1.5,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#D4AF37',
  },
  confirmButtonText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 12,
  }
});
