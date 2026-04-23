import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../supabase';
import { ChevronLeft, Send, Search, Building2, Globe } from 'lucide-react-native';
import * as Device from 'expo-device';

export default function TransferScreen({ user, onBack }) {
  const [banks, setBanks] = useState([{ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false }]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [senderAccount, setSenderAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      // 1. Get sender account
      const { data: acc } = await supabase.from('accounts').select('*').eq('user_id', user.id).single();
      setSenderAccount(acc);

      // 2. Fetch external banks from Supabase
      try {
        const { data: extBanks } = await supabase.from('external_banks').select('*');
        if (extBanks) {
          const formattedExt = extBanks.map(b => ({ ...b, is_external: true }));
          setBanks([{ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false }, ...formattedExt]);
        }
      } catch (e) {
        console.log("No external banks table found yet");
      }
      setSelectedBank({ id: 'internal', name: 'Banco Aerum (Interno)', is_external: false });
    };
    init();
  }, []);

  const handleTransfer = async () => {
    if (!selectedBank || !recipientAccount || !amount) {
      Alert.alert('Error', 'Complete todos los campos obligatorios');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount > senderAccount.balance) {
      Alert.alert('Error', 'Saldo insuficiente');
      return;
    }

    setLoading(true);
    try {
      const audit = {
        browser: `Expo App ${Platform.OS}`,
        device: `${Device.brand} ${Device.modelName}`,
        location: `Plataforma ${Platform.OS} ${Platform.Version}`
      };

      if (selectedBank.is_external) {
        // --- LÓGICA INTERBANCARIA (EXTERNA) ---
        const cleanUrl = selectedBank.api_url.endsWith('/') ? selectedBank.api_url.slice(0, -1) : selectedBank.api_url;
        const response = await fetch(`${cleanUrl}/receive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_number: recipientAccount,
            amount: transferAmount,
            from_bank: 'Banco Aerum Mobile',
            description: description || 'Transferencia desde Dispositivo Móvil',
            api_key: selectedBank.api_key
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'El banco destino rechazó la operación');

        // Registrar salida local con auditoría
        await supabase.from('transactions').insert([{
          account_id: senderAccount.id, 
          amount: transferAmount, 
          type: 'TRANSFERENCIA',
          description: `Interbancario a ${selectedBank.name}: ${recipientAccount}`,
          ...audit
        }]);
        await supabase.from('accounts').update({ balance: senderAccount.balance - transferAmount }).eq('id', senderAccount.id);

      } else {
        // --- LÓGICA INTERNA (AERUM) ---
        const { data: recipient, error: recError } = await supabase
          .from('accounts').select('id, balance').eq('account_number', recipientAccount).single();
        
        if (recError || !recipient) throw new Error('La cuenta no existe en Banco Aerum');
        if (recipient.id === senderAccount.id) throw new Error('No puede transferir a su propia cuenta');

        // Emisor
        await supabase.from('transactions').insert([{
          account_id: senderAccount.id, 
          amount: transferAmount, 
          type: 'TRANSFERENCIA',
          description: description || `Envío a ${recipientAccount}`,
          ...audit
        }]);
        await supabase.from('accounts').update({ balance: senderAccount.balance - transferAmount }).eq('id', senderAccount.id);
        
        // Receptor
        await supabase.from('transactions').insert([{
          account_id: recipient.id, 
          amount: transferAmount, 
          type: 'CREDITO',
          description: `Recibido de ${senderAccount.account_number}`,
          browser: 'App Móvil (Recibido)',
          device: 'Red Banco Aerum',
          location: 'Interno'
        }]);
        await supabase.from('accounts').update({ balance: recipient.balance + transferAmount }).eq('id', recipient.id);
      }

      Alert.alert('Éxito', 'Operación completada con éxito', [{ text: 'ENTENDIDO', onPress: onBack }]);
    } catch (err) {
      Alert.alert('Error en Operación', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ChevronLeft size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TRANSFERIR</Text>
        </View>

        <View style={styles.senderCard}>
          <Text style={styles.senderLabel}>SALDO DISPONIBLE</Text>
          <Text style={styles.senderBalance}>$ {senderAccount?.balance?.toLocaleString() || '0'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>SELECCIONAR INSTITUCIÓN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankList}>
            {banks.map(bank => (
              <TouchableOpacity 
                key={bank.id} 
                style={[styles.bankItem, selectedBank?.id === bank.id && styles.selectedBankItem]}
                onPress={() => setSelectedBank(bank)}
              >
                {bank.is_external ? <Globe size={18} color={selectedBank?.id === bank.id ? "black" : "#D4AF37"} /> : <Building2 size={18} color={selectedBank?.id === bank.id ? "black" : "#D4AF37"} />}
                <Text style={[styles.bankText, selectedBank?.id === bank.id && styles.selectedBankText]}>{bank.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NÚMERO DE CUENTA DESTINO</Text>
            <View style={styles.inputBox}>
              <Search size={18} color="#D4AF37" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="00000000" 
                placeholderTextColor="#444" 
                value={recipientAccount} 
                onChangeText={setRecipientAccount} 
                keyboardType="number-pad" 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MONTO A ENVIAR</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput 
                style={styles.input} 
                placeholder="0.00" 
                placeholderTextColor="#444" 
                value={amount} 
                onChangeText={setAmount} 
                keyboardType="decimal-pad" 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GLOSA / COMENTARIO (OPCIONAL)</Text>
            <View style={styles.inputBox}>
              <TextInput 
                style={styles.input} 
                placeholder="Motivo del envío" 
                placeholderTextColor="#444" 
                value={description} 
                onChangeText={setDescription} 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.transferButton, loading && { opacity: 0.5 }]} 
            onPress={handleTransfer} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="black" /> : <Send size={20} color="black" />}
            <Text style={styles.transferButtonText}>EJECUTAR TRANSFERENCIA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  backButton: { backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: 12, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.1)' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  senderCard: { backgroundColor: '#111', padding: 28, borderRadius: 24, marginBottom: 35, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  senderLabel: { color: '#D4AF37', fontSize: 10, marginBottom: 10, fontWeight: '800', letterSpacing: 1 },
  senderBalance: { color: 'white', fontSize: 32, fontWeight: '800' },
  bankList: { marginBottom: 25, maxHeight: 60 },
  bankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 15, marginRight: 10, gap: 10, height: 50, borderWidth: 1, borderColor: '#222' },
  selectedBankItem: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  bankText: { color: '#666', fontWeight: '800', fontSize: 13 },
  selectedBankText: { color: 'black' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { color: '#888', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 18, paddingHorizontal: 18, height: 65, borderWidth: 1, borderColor: '#222' },
  inputIcon: { marginRight: 12 },
  currencyPrefix: { color: '#D4AF37', fontSize: 20, fontWeight: '800', marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 16, fontWeight: '600' },
  transferButton: { backgroundColor: '#D4AF37', height: 70, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  transferButtonText: { color: 'black', fontSize: 14, fontWeight: '900', letterSpacing: 1 }
});
