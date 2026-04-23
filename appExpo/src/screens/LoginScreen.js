import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../supabase';
import { Mail, Lock, LogIn, Cpu } from 'lucide-react-native';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onLoginSuccess(data.user);
    } catch (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Cpu size={40} color="white" />
        </View>
        <Text style={styles.title}>BANCO <Text style={{ color: '#00D2FF' }}>AERUM</Text></Text>
        <Text style={styles.subtitle}>Futuro Digital de tus Finanzas</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <LogIn size={20} color="white" />
              <Text style={styles.buttonText}>Ingresar</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001A2E',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#0070F3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#888',
    marginTop: 5,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002D4F',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0070F3',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerHighlight: {
    color: '#00D2FF',
    fontWeight: '600',
  },
});
