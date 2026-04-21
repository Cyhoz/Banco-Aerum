import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Plus, 
  Send, 
  ShieldCheck,
  History,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ user, onLogout }) => {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.branding}>
            <ShieldCheck size={28} color="#d4af37" />
            <Text style={styles.brandTitle}>AUREUM</Text>
          </View>
          <View style={styles.userSection}>
            <View style={styles.userText}>
              <Text style={styles.welcome}>Bienvenido,</Text>
              <Text style={styles.userName}>{user?.user_metadata?.full_name || 'VIP'}</Text>
            </View>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <LogOut size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Card */}
        <LinearGradient 
          colors={['#1e1e1e', '#121212']} 
          style={styles.accountCard}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>SALDO DISPONIBLE</Text>
            <CreditCard color="rgba(229, 228, 226, 0.3)" size={24} />
          </View>
          <View style={styles.balanceSection}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.balance}>12,450.00</Text>
          </View>
          <View style={styles.cardBottom}>
            <View>
              <View style={styles.accNumberRow}>
                <Text style={styles.cardLabel}>NUMERO DE CUENTA</Text>
                <TouchableOpacity onPress={() => setShowAccountNumber(!showAccountNumber)}>
                  {showAccountNumber ? <EyeOff size={14} color="#d4af37" /> : <Eye size={14} color="#d4af37" />}
                </TouchableOpacity>
              </View>
              <Text style={styles.accNumber}>
                {showAccountNumber ? '9923-4567-8901' : '**** **** 8901'}
              </Text>
            </View>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png' }} 
              style={styles.cardType}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <LinearGradient colors={['#aa8a2e', '#d4af37']} style={styles.actionIcon}>
              <Plus size={24} color="#000" />
            </LinearGradient>
            <Text style={styles.actionText}>DEPOSITAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconDark}>
              <Send size={24} color="#d4af37" />
            </View>
            <Text style={styles.actionText}>TRANSFERIR</Text>
          </TouchableOpacity>
        </View>

        {/* Yield Info */}
        <View style={styles.yieldCard}>
           <TrendingUp color="#d4af37" size={24} />
           <View style={{ marginLeft: 15 }}>
             <Text style={styles.yieldLabel}>Rendimiento Anual</Text>
             <Text style={styles.yieldValue}>+ 4.25% APY</Text>
           </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsHeader}>
          <History size={20} color="#d4af37" />
          <Text style={styles.transactionsTitle}>ACTIVIDAD RECIENTE</Text>
        </View>

        <View style={styles.transactionList}>
          <TransactionItem 
            title="Depósito Aurum" 
            date="21 Abr 2026" 
            amount="+5,000" 
            type="CREDITO" 
          />
          <TransactionItem 
            title="Suscripción Premium" 
            date="20 Abr 2026" 
            amount="-150" 
            type="DEBITO" 
          />
          <TransactionItem 
            title="Cena Gala" 
            date="19 Abr 2026" 
            amount="-850" 
            type="DEBITO" 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const TransactionItem = ({ title, date, amount, type }) => (
  <View style={styles.transItem}>
    <View style={styles.transLeft}>
      <View style={[styles.transIcon, { backgroundColor: type === 'CREDITO' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
        {type === 'CREDITO' ? <ArrowDownLeft color="#4caf50" size={18} /> : <ArrowUpRight color="#f44336" size={18} />}
      </View>
      <View>
        <Text style={styles.transTitle}>{title}</Text>
        <Text style={styles.transDate}>{date}</Text>
      </View>
    </View>
    <View style={styles.transRight}>
      <Text style={[styles.transAmount, { color: type === 'CREDITO' ? '#4caf50' : '#f44336' }]}>
        {amount}
      </Text>
      <Text style={styles.transStatus}>EXITOSO</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  userText: {
    alignItems: 'flex-end',
  },
  welcome: {
    color: '#a0a0a0',
    fontSize: 10,
  },
  userName: {
    color: '#fff',
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    borderRadius: 20,
  },
  accountCard: {
    borderRadius: 20,
    padding: 25,
    height: 200,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(229, 228, 226, 0.15)',
    marginBottom: 30,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#a0a0a0',
    fontSize: 10,
    letterSpacing: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    color: '#d4af37',
    fontSize: 20,
    marginRight: 5,
  },
  balance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  accNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  accNumber: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 1,
  },
  cardType: {
    width: 40,
    height: 25,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: '100%',
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconDark: {
    width: '100%',
    height: 70,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  yieldCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  yieldLabel: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  yieldValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  transactionsTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  transactionList: {
    gap: 15,
  },
  transItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 15,
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  transIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  transDate: {
    color: '#666',
    fontSize: 12,
  },
  transRight: {
    alignItems: 'flex-end',
  },
  transAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  transStatus: {
    color: '#666',
    fontSize: 9,
  }
});

export default DashboardScreen;
