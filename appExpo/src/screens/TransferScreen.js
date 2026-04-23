import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../supabase';
import { ChevronLeft, ArrowRightLeft, Send, Search } from 'lucide-react-native';

export default function TransferScreen({ user, onBack }) {
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [senderAccount, setSenderAccount] = useState(null);

  useEffect(() => {
    const fetchSender = async () => {
      const { data } = await supabase.from('accounts').select('*').eq('user_id', user.id).single();
      setSenderAccount(data);
    };
    fetchSender();
  }, []);

  const handleTransfer = async () => {
    if (!recipientAccount || !amount) {
      Alert.alert('Error', 'Complete los campos obligatorios');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert('Error', 'Monto inválido');
      return;
    }

    if (transferAmount > senderAccount.balance) {
      Alert.alert('Error', 'Saldo insuficiente');
      return;
    }

    setLoading(true);
    try {
      // 1. Find recipient
      const { data: recipient, error: recError } = await supabase
        .from('accounts')
        .select('id, balance, account_number')
        .eq('account_number', recipientAccount)
        .single();
      
      if (recError || !recipient) throw new Error('Cuenta destino no encontrada');
      if (recipient.id === senderAccount.id) throw new Error('No puedes transferir a tu propia cuenta');

      // 2. Perform transaction (We'd use a RPC or Transaction in a real Supabase app, 
      // but for this demo we'll do sequential updates)
      
      // Debit sender
      await supabase.from('transactions').insert([{
        account_id: senderAccount.id,
        amount: transferAmount,
        description: description || `Transferencia a ${recipientAccount}`,
        type: 'TRANSFERENCIA'
      }]);
      await supabase.from('accounts').update({ balance: senderAccount.balance - transferAmount }).eq('id', senderAccount.id);

      // Credit recipient
      await supabase.from('transactions').insert([{
        account_id: recipient.id,
        amount: transferAmount,
        description: `Transferencia de ${senderAccount.account_number}`,
        type: 'CREDITO'
      }]);
      await supabase.from('accounts').update({ balance: recipient.balance + transferAmount }).eq('id', recipient.id);

      Alert.alert('Éxito', 'Transferencia realizada correctamente', [{ text: 'OK', onPress: onBack }]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transferir Dinero</Text>
        </View>

        <View style={styles.senderCard}>
          <Text style={styles.senderLabel}>Saldo disponible</Text>
          <Text style={styles.senderBalance}>${senderAccount?.balance?.toLocaleString() || '0.00'}</Text>
          <Text style={styles.senderAccount}>Desde: {senderAccount?.account_number}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Cuenta Destino</Text>
          <View style={styles.inputBox}>
            <Search size={18} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Número de cuenta (99...)"
              placeholderTextColor="#666"
              value={recipientAccount}
              onChangeText={setRecipientAccount}
              keyboardType="number-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Monto a enviar</Text>
          <View style={styles.inputBox}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#666"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Descripción (Opcional)</Text>
          <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 15 }]}>
            <TextInput
              style={[styles.input, { textAlignVertical: 'top' }]}
              placeholder="Ej: Pago de almuerzo"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.transferButton, loading && { opacity: 0.7 }]} 
            onPress={handleTransfer}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={20} color="white" />
                <Text style={styles.transferButtonText}>Confirmar Envío</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001A2E',
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#002D4F',
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
  senderCard: {
    backgroundColor: '#002D4F',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.1)',
  },
  senderLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  senderBalance: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 5,
  },
  senderAccount: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    gap: 15,
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D4F',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: 10,
  },
  currencyPrefix: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  transferButton: {
    backgroundColor: '#0070F3',
    height: 65,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  transferButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  }
});
