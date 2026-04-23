import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { ShieldCheck, ChevronRight, Wallet, Globe, Shield, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onStartLogin }) {
  return (
    <View style={styles.container}>
      {/* Navbar Minimalista */}
      <View style={styles.navbar}>
        <View style={styles.logoRow}>
          <ShieldCheck size={28} color="#D4AF37" />
          <Text style={styles.logoText}>AERUM</Text>
        </View>
        <TouchableOpacity style={styles.loginNavBtn} onPress={onStartLogin}>
          <Text style={styles.loginNavText}>LOGIN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BANCA PRIVADA • 2026</Text>
          </View>
          <Text style={styles.heroTitle}>
            El Futuro de sus <Text style={{ color: '#D4AF37' }}>Finanzas</Text> en sus Manos
          </Text>
          <Text style={styles.heroSubtitle}>
            Gestione su patrimonio con la seguridad de Banco Aerum. Tecnología de vanguardia y exclusividad en cada transacción.
          </Text>
          
          <TouchableOpacity style={styles.mainBtn} onPress={onStartLogin}>
            <Text style={styles.mainBtnText}>COMENZAR AHORA</Text>
            <ChevronRight size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Globe size={24} color="#D4AF37" />
            </View>
            <Text style={styles.featureTitle}>Global</Text>
            <Text style={styles.featureDesc}>Conectado con los principales bancos del mundo.</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Shield size={24} color="#D4AF37" />
            </View>
            <Text style={styles.featureTitle}>Seguro</Text>
            <Text style={styles.featureDesc}>Encriptación de grado militar en sus ahorros.</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Zap size={24} color="#D4AF37" />
            </View>
            <Text style={styles.featureTitle}>Instantáneo</Text>
            <Text style={styles.featureDesc}>Transferencias en tiempo real sin esperas.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 BANCO AERUM CORPORATION</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  navbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 25, 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#1A1A1A'
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  loginNavBtn: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#D4AF37' 
  },
  loginNavText: { color: '#D4AF37', fontSize: 12, fontWeight: '800' },
  scrollContent: { paddingBottom: 50 },
  hero: { padding: 30, paddingTop: 60, alignItems: 'center' },
  badge: { 
    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)'
  },
  badgeText: { color: '#D4AF37', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { 
    color: 'white', 
    fontSize: 42, 
    fontWeight: '900', 
    textAlign: 'center', 
    lineHeight: 50,
    marginBottom: 20
  },
  heroSubtitle: { 
    color: '#666', 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24, 
    paddingHorizontal: 10,
    marginBottom: 40
  },
  mainBtn: { 
    backgroundColor: '#D4AF37', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    paddingVertical: 18, 
    borderRadius: 20,
    gap: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  mainBtnText: { color: 'black', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  features: { padding: 30, gap: 20 },
  featureItem: { 
    backgroundColor: '#111', 
    padding: 25, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#222' 
  },
  featureIcon: { 
    backgroundColor: 'rgba(212, 175, 55, 0.05)', 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15
  },
  featureTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 5 },
  featureDesc: { color: '#666', fontSize: 14, lineHeight: 20 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1 }
});
