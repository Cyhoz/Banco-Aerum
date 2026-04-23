import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../supabase';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Bell, LogOut, ShieldCheck } from 'lucide-react-native';

export default function HomeScreen({ user, onLogout, onNavigate }) {
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch account
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (accError) throw accError;
      const mainAccount = accounts[0];
      setAccount(mainAccount);

      if (mainAccount) {
        // Fetch transactions
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
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeposit = async () => {
    // Note: In a real app we'd use a Modal. For simplicity in this script, we'll just add a fixed amount
    // or simulate it. 
    Alert.prompt(
      "Depositar fondos",
      "Ingrese el monto a depositar:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Depositar", 
          onPress: async (amount) => {
            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
            try {
              setLoading(true);
              const { error: txError } = await supabase.from('transactions').insert([{
                account_id: account.id,
                amount: parseFloat(amount),
                description: 'Depósito de fondos (Expo)',
                type: 'CREDITO'
              }]);
              
              if (txError) throw txError;

              // Update balance
              const { error: upError } = await supabase
                .from('accounts')
                .update({ balance: account.balance + parseFloat(amount) })
                .eq('id', account.id);
              
              if (upError) throw upError;

              fetchData();
              Alert.alert("Éxito", "Depósito realizado correctamente");
            } catch (err) {
              Alert.alert("Error", err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D2FF" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hola,</Text>
            <Text style={styles.userName}>{user.user_metadata?.full_name || 'Usuario'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]} onPress={onLogout}>
              <LogOut size={24} color="#ff453a" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Saldo disponible</Text>
            <Wallet size={20} color="white" opacity={0.8} />
          </View>
          <Text style={styles.balanceText}>${account?.balance?.toLocaleString() || '0.00'}</Text>
          <Text style={styles.accountNumber}>Cuenta: {account?.account_number || '****'}</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(0, 210, 255, 0.1)' }]}>
              <Plus size={24} color="#00D2FF" />
            </View>
            <Text style={styles.actionText}>Ingresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('transfer')}>
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(0, 112, 243, 0.1)' }]}>
              <ArrowUpRight size={24} color="#0070F3" />
            </View>
            <Text style={styles.actionText}>Transferir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            <TouchableOpacity onPress={() => onNavigate('history')}>
              <Text style={styles.viewAllText}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {history.length > 0 ? history.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={[styles.txIconContainer, { backgroundColor: tx.type === 'CREDITO' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 69, 58, 0.1)' }]}>
                {tx.type === 'CREDITO' ? (
                  <ArrowDownLeft size={20} color="#00ff7f" />
                ) : (
                  <ArrowUpRight size={20} color="#ff453a" />
                )}
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDescription}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'CREDITO' ? '#00ff7f' : 'white' }]}>
                {tx.type === 'CREDITO' ? '+' : '-'}${tx.amount.toLocaleString()}
              </Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>No hay movimientos aún</Text>
          )}
        </View>
      </ScrollView>

      {/* Admin Quick Access if applicable */}
      {(user.user_metadata?.role === 'admin' || user.email.includes('admin')) && (
        <TouchableOpacity style={styles.adminFab} onPress={() => onNavigate('admin')}>
          <ShieldCheck size={24} color="white" />
          <Text style={styles.adminFabText}>Panel Admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001A2E',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#001A2E',
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
    marginBottom: 30,
  },
  welcomeText: {
    color: '#888',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: '#002D4F',
    padding: 10,
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#0070F3',
    borderRadius: 25,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardLabel: {
    color: 'white',
    opacity: 0.8,
    fontSize: 14,
  },
  balanceText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  accountNumber: {
    color: 'white',
    opacity: 0.8,
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 35,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#002D4F',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  actionIconContainer: {
    padding: 12,
    borderRadius: 15,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    color: '#00D2FF',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D4F',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
  },
  txIconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  txDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  adminFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#0070F3',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  adminFabText: {
    color: 'white',
    fontWeight: '700',
  }
});
