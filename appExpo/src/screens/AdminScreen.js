import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { supabase } from '../../supabase';
import { ShieldCheck, Users, Activity, Search, ArrowUpRight, ArrowDownLeft, ChevronLeft } from 'lucide-react-native';

export default function AdminScreen({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllData = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, accounts(account_number)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accounts?.account_number?.includes(searchTerm)
  );

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00D2FF" />
      <Text style={styles.loadingText}>Cargando Auditoría...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.badge}>
            <ShieldCheck size={18} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Panel Admin</Text>
            <Text style={styles.headerSubtitle}>AUDITORÍA GLOBAL</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Activity size={24} color="#00D2FF" />
          <Text style={styles.statLabel}>TOTAL TX</Text>
          <Text style={styles.statValue}>{transactions.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={24} color="#0070F3" />
          <Text style={styles.statLabel}>CLIENTES</Text>
          <Text style={styles.statValue}>{new Set(transactions.map(t => t.account_id)).size}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar cuenta o glosa..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <Text style={styles.listTitle}>Libro de Movimientos</Text>
      
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.txItem}>
            <View style={[styles.txIcon, { backgroundColor: item.type === 'CREDITO' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 69, 58, 0.1)' }]}>
              {item.type === 'CREDITO' ? (
                <ArrowDownLeft size={18} color="#00ff7f" />
              ) : (
                <ArrowUpRight size={18} color="#ff453a" />
              )}
            </View>
            <View style={styles.txMain}>
              <Text style={styles.txDesc}>{item.description}</Text>
              <Text style={styles.txAccount}>Cuenta: ****{item.accounts?.account_number?.slice(-4)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>${item.amount.toLocaleString()}</Text>
              <Text style={styles.txTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron registros</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001A2E',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#001A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00D2FF',
    marginTop: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#002D4F',
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#0070F3',
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#00D2FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#002D4F',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.1)',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 10,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D4F',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
  },
  listTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D4F',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  txIcon: {
    padding: 8,
    borderRadius: 10,
    marginRight: 15,
  },
  txMain: {
    flex: 1,
  },
  txDesc: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  txAccount: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  txTime: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  }
});
