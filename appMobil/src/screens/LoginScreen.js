import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Mail, Lock, User } from 'lucide-react-native';

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    // Simulating auth for now
    setTimeout(() => {
      onLogin({ email, name: name || 'Usuario VIP', user_metadata: { full_name: name || 'Usuario VIP' } });
      setLoading(false);
    }, 1500);
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#000000']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.inner}
      >
        <View style={styles.header}>
          <ShieldCheck size={60} color="#d4af37" />
          <Text style={styles.title}>AUREUM BANK</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'EL PRESTIGIO DE TU FINANZA' : 'ÚNETE A LA EXCLUSIVIDAD'}
          </Text>
        </View>

        <View style={styles.card}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#666" style={styles.icon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Nombre Apellido"
                  placeholderTextColor="#444"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input}
                placeholder="usuario@aureum.com"
                placeholderTextColor="#444"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#444"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient 
              colors={['#aa8a2e', '#d4af37']} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'ACCEDER AL CLUB' : 'CREAR CUENTA PREMIUM'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#d4af37',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 10,
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 5,
  },
  card: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(229, 228, 226, 0.15)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#f1d592',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    height: 50,
  },
  icon: {
    position: 'absolute',
    left: 15,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(229, 228, 226, 0.15)',
    borderRadius: 10,
    paddingLeft: 45,
    color: '#fff',
    height: '100%',
  },
  button: {
    marginTop: 10,
    height: 55,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    letterSpacing: 1,
  },
  toggle: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#a0a0a0',
    fontSize: 12,
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
