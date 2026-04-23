import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { supabase } from './supabase';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransferScreen from './src/screens/TransferScreen';
import AdminScreen from './src/screens/AdminScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

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
    setShowLogin(false);
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;

  if (!user) {
    if (showLogin) {
      return <LoginScreen onLoginSuccess={(u) => setUser(u)} onBack={() => setShowLogin(false)} />;
    }
    return <WelcomeScreen onStartLogin={() => setShowLogin(true)} />;
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
