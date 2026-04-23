import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { supabase } from './supabase';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransferScreen from './src/screens/TransferScreen';
import AdminScreen from './src/screens/AdminScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home'); // home, transfer, history, admin
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;

  if (!user) {
    return <LoginScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  // Simple Router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen user={user} onLogout={handleLogout} onNavigate={setCurrentScreen} />;
      case 'transfer':
        return <TransferScreen user={user} onBack={() => setCurrentScreen('home')} />;
      case 'admin':
        return <AdminScreen onBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen user={user} onLogout={handleLogout} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
