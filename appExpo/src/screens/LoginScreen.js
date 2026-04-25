import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../supabase';
import { Mail, Lock, LogIn, ShieldCheck, ChevronLeft, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ onLoginSuccess, onBack, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkDeviceForHardware();
  }, []);

  const checkDeviceForHardware = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);

    // Si hay datos guardados, intentar login automático o al menos llenar los campos
    const savedEmail = await SecureStore.getItemAsync('user_email');
    if (savedEmail) setEmail(savedEmail);
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Acceso Biométrico - Banco Aerum',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setLoading(true);
        const savedEmail = await SecureStore.getItemAsync('user_email');
        const savedPass = await SecureStore.getItemAsync('user_password');

        if (savedEmail && savedPass) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: savedEmail,
            password: savedPass,
          });

          if (error) throw error;
          onLoginSuccess(data.user);
        } else {
          Alert.alert('Configuración requerida', 'Inicie sesión con su contraseña una vez para activar la huella.');
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo autenticar');
      setLoading(false);
    }
  };

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

      // Preguntar si desea guardar para la próxima vez
      if (isBiometricAvailable) {
        Alert.alert(
          'Acceso Rápido',
          '¿Desea activar el acceso con huella digital para su próxima visita?',
          [
            { text: 'No, gracias', onPress: () => onLoginSuccess(data.user) },
            { 
              text: 'Sí, activar', 
              onPress: async () => {
                await SecureStore.setItemAsync('user_email', email);
                await SecureStore.setItemAsync('user_password', password);
                onLoginSuccess(data.user);
              }
            }
          ]
        );
      } else {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      Alert.alert('Error de acceso', error.message);
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <ShieldCheck size={44} color="black" />
        </View>
        <Text style={styles.title}>BANCO <Text style={{ color: '#D4AF37' }}>AERUM</Text></Text>
        <Text style={styles.subtitle}>EXCELENCIA FINANCIERA</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#D4AF37" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#D4AF37" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.button, { flex: 1 }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <View style={styles.buttonContent}>
                <LogIn size={20} color="black" />
                <Text style={styles.buttonText}>ACCEDER</Text>
              </View>
            )}
          </TouchableOpacity>

          {isBiometricAvailable && (
            <TouchableOpacity 
              style={styles.biometricButton} 
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Fingerprint size={32} color="#D4AF37" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={onRegister}>
          <Text style={styles.registerText}>
            ¿Aún no es cliente? <Text style={styles.registerHighlight}>Solicite su cuenta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -10,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  logoContainer: {
    width: 90,
    height: 90,
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#888',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 18,
    marginBottom: 15,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1,
    borderColor: '#222',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D4AF37',
    height: 65,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  biometricButton: {
    backgroundColor: '#111',
    height: 65,
    width: 65,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 40,
    alignItems: 'center',
  },
  registerText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  registerHighlight: {
    color: '#D4AF37',
    fontWeight: '800',
  },
});
