import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Alert, Modal } from 'react-native';
import { supabase, supabaseAdmin } from '../../supabase';
import { ShieldCheck, Users, Activity, Search, ArrowUpRight, ArrowDownLeft, ChevronLeft, UserPlus, Trash2, Mail, Lock, User } from 'lucide-react-native';

export default function AdminScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'users'
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create User Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'transactions') {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, accounts(account_number)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTransactions(data || []);
      } else {
        const { data: { users: allUsers }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        setUsers(allUsers || []);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      // 1. Create User in Auth
      const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: { full_name: newUser.full_name, role: newUser.role },
        email_confirm: true
      });

      if (error) throw error;

      // 2. Create Initial Account
      const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
      const { error: accError } = await supabaseAdmin
        .from('accounts')
        .insert([{ user_id: user.id, account_number: accountNumber, balance: 50.00 }]);
      
      if (accError) throw accError;

      setIsModalVisible(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      fetchData();
      Alert.alert('Éxito', 'Usuario y cuenta creados correctamente');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId, email) => {
    Alert.alert(
      "Eliminar Usuario",
      `¿Estás seguro de eliminar a ${email}? Esta acción es irreversible.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
              if (error) throw error;
              fetchData();
              Alert.alert("Éxito", "Usuario eliminado");
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

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accounts?.account_number?.includes(searchTerm)
  );

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Text style={styles.headerSubtitle}>GESTIÓN ESTRATÉGICA</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Activity size={20} color={activeTab === 'transactions' ? 'white' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>Movimientos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]} 
          onPress={() => setActiveTab('users')}
        >
          <Users size={20} color={activeTab === 'users' ? 'white' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Usuarios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder={activeTab === 'transactions' ? "Buscar transacción..." : "Buscar usuario..."}
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {activeTab === 'users' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <UserPlus size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D2FF" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'transactions' ? filteredTransactions : filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            activeTab === 'transactions' ? (
              <View style={styles.item}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'CREDITO' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 69, 58, 0.1)' }]}>
                  {item.type === 'CREDITO' ? <ArrowDownLeft size={18} color="#00ff7f" /> : <ArrowUpRight size={18} color="#ff453a" />}
                </View>
                <View style={styles.mainInfo}>
                  <Text style={styles.titleText}>{item.description}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                    <Text style={styles.subText}>Cuenta: ****{item.accounts?.account_number?.slice(-4)}</Text>
                    <Text style={[styles.subText, { color: '#D4AF37', fontWeight: '800' }]}>ID: {item.accounts?.user_id?.slice(0, 6)}</Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditText}>{item.browser?.split(' ')[0] || 'App'}</Text>
                    <View style={styles.auditDot} />
                    <Text style={styles.auditText}>{item.device || 'Mobile'}</Text>
                    <View style={styles.auditDot} />
                    <Text style={[styles.auditText, { color: '#0070F3' }]}>{item.location || 'Local'}</Text>
                  </View>
                </View>
                <Text style={styles.amountText}>${item.amount.toLocaleString()}</Text>
              </View>
            ) : (
              <View style={styles.item}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 112, 243, 0.1)' }]}>
                  <User size={18} color="#0070F3" />
                </View>
                <View style={styles.mainInfo}>
                  <Text style={styles.titleText}>{item.user_metadata?.full_name || 'Sin nombre'}</Text>
                  <Text style={styles.subText}>{item.email}</Text>
                  <Text style={[styles.roleBadge, item.user_metadata?.role === 'admin' && styles.adminRole]}>
                    {item.user_metadata?.role?.toUpperCase() || 'USER'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteUser(item.id, item.email)}>
                  <Trash2 size={20} color="#ff453a" />
                </TouchableOpacity>
              </View>
            )
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay resultados</Text>}
        />
      )}

      {/* Create User Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Cliente</Text>
            
            <View style={styles.modalForm}>
              <View style={styles.inputWrap}>
                <User size={18} color="#666" />
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Nombre Completo" 
                  placeholderTextColor="#666"
                  value={newUser.full_name}
                  onChangeText={(v) => setNewUser({...newUser, full_name: v})}
                />
              </View>
              <View style={styles.inputWrap}>
                <Mail size={18} color="#666" />
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Email" 
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  value={newUser.email}
                  onChangeText={(v) => setNewUser({...newUser, email: v})}
                />
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#666" />
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="Contraseña" 
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={newUser.password}
                  onChangeText={(v) => setNewUser({...newUser, password: v})}
                />
              </View>
              
              <View style={styles.roleSelector}>
                <TouchableOpacity 
                  style={[styles.roleBtn, newUser.role === 'user' && styles.activeRoleBtn]}
                  onPress={() => setNewUser({...newUser, role: 'user'})}
                >
                  <Text style={[styles.roleBtnText, newUser.role === 'user' && styles.activeRoleBtnText]}>USER</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleBtn, newUser.role === 'admin' && styles.activeRoleBtn]}
                  onPress={() => setNewUser({...newUser, role: 'admin'})}
                >
                  <Text style={[styles.roleBtnText, newUser.role === 'admin' && styles.activeRoleBtnText]}>ADMIN</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateUser}>
                <Text style={styles.modalConfirmText}>Crear Usuario</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 25 },
  backButton: { backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: 12, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: '#D4AF37', padding: 8, borderRadius: 10 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#D4AF37', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 15, backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  activeTab: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  tabText: { color: '#666', fontWeight: '800', fontSize: 11 },
  activeTabText: { color: 'black' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', marginHorizontal: 20, borderRadius: 18, paddingHorizontal: 15, height: 60, marginBottom: 25, borderWidth: 1, borderColor: '#222' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: 'white', fontWeight: '600' },
  addButton: { backgroundColor: '#D4AF37', padding: 10, borderRadius: 12, marginLeft: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 18, borderRadius: 22, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  iconBox: { padding: 10, borderRadius: 14, marginRight: 15 },
  mainInfo: { flex: 1 },
  titleText: { color: 'white', fontWeight: '800', fontSize: 15 },
  subText: { color: '#666', fontSize: 11, marginTop: 4, fontWeight: '600' },
  auditRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  auditText: { fontSize: 9, color: '#444', fontWeight: '800', letterSpacing: 0.5 },
  auditDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#333' },
  amountText: { color: 'white', fontWeight: '900', fontSize: 16 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 50, fontWeight: '700' },
  roleBadge: { fontSize: 9, fontWeight: '900', color: '#D4AF37', marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 6, letterSpacing: 1 },
  adminRole: { color: '#ff453a', backgroundColor: 'rgba(255, 69, 58, 0.1)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#111', borderRadius: 30, padding: 35, borderWidth: 1, borderColor: '#D4AF37' },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 30, letterSpacing: 1 },
  modalForm: { gap: 15 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 18, paddingHorizontal: 18, height: 60, borderWidth: 1, borderColor: '#222' },
  modalInput: { flex: 1, color: 'white', marginLeft: 12, fontWeight: '600' },
  roleSelector: { flexDirection: 'row', gap: 12, marginTop: 10 },
  roleBtn: { flex: 1, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  activeRoleBtn: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  roleBtnText: { color: '#444', fontWeight: '800', fontSize: 12 },
  activeRoleBtnText: { color: 'black' },
  modalButtons: { flexDirection: 'row', gap: 15, marginTop: 35 },
  modalCancel: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  modalCancelText: { color: 'white', fontWeight: '800', fontSize: 12 },
  modalConfirm: { flex: 2, padding: 18, borderRadius: 15, alignItems: 'center', backgroundColor: '#D4AF37' },
  modalConfirmText: { color: 'black', fontWeight: '900', fontSize: 12 }
});
