import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Mail, Lock, User, ShieldCheck, ChevronLeft, UserPlus } from 'lucide-react-native';

const API_URL = 'https://banco-aerum.vercel.app/api';

export default function RegisterScreen({ onBack, onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar usuario');
      }

      Alert.alert(
        '¡Bienvenido!',
        'Cuenta creada con éxito. Ya puede iniciar sesión con sus credenciales.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert('Error de Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ChevronLeft size={24} color="#D4AF37" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <ShieldCheck size={44} color="black" />
          </View>
          <Text style={styles.title}>BANCO <Text style={{ color: '#D4AF37' }}>AERUM</Text></Text>
          <Text style={styles.subtitle}>SOLICITUD DE APERTURA</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#D4AF37" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#444"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

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

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <View style={styles.buttonContent}>
                <UserPlus size={20} color="black" />
                <Text style={styles.buttonText}>CREAR CUENTA</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={onBack}>
            <Text style={styles.loginText}>
              ¿Ya tiene cuenta? <Text style={styles.loginHighlight}>Inicie sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    width: 80,
    height: 80,
    backgroundColor: '#D4AF37',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#888',
    marginTop: 8,
    fontSize: 10,
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
    height: 60,
    borderWidth: 1,
    borderColor: '#222',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D4AF37',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginText: {
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  loginHighlight: {
    color: '#D4AF37',
    fontWeight: '800',
  },
});
