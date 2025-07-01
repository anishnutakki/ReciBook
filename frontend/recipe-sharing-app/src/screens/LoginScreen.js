import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { loginUser } from '../services/auth';

const webStyles = {
  container: {
    height: '100vh',
    width: '100vw',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 0,
    padding: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollableContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    width: '100vw',
    height: '100%',
    minHeight: '100vh',
    border: 'none',
    borderRadius: '24px 24px 0 0',
    padding: '24px',
    margin: 0,
    boxSizing: 'border-box',
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 2,
  },
};

// React Native styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 4px 8px rgba(0,0,0,0.1)' : undefined,
  },
  tagline: {
    fontSize: 20,
    color: '#6366f1',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '600',
    textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
  },
  formContainer: {
    ...(Platform.OS === 'web' ? { background: 'rgba(255, 255, 255, 0.95)' } : { backgroundColor: 'white' }),
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
    backdropFilter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 2px 4px rgba(0,0,0,0.05)' : undefined,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  input: {
    ...(Platform.OS === 'web' ? { background: 'rgba(248, 250, 248, 0.8)' } : { backgroundColor: '#f8faf8' }),
    borderWidth: 2,
    borderColor: Platform.OS === 'web' ? 'rgba(99, 102, 241, 0.2)' : '#E8F5E8',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginButton: {
    ...(Platform.OS === 'web' ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' } : { backgroundColor: '#6366f1' }),
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.1)' : undefined,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#6366f1',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: 8,
  },
  registerButtonText: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    textShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.05)' : undefined,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 20,
    color: '#6366f1',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
    fontWeight: '600',
  },
  errorContainer: {
    ...(Platform.OS === 'web' ? { background: 'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 100%)' } : { backgroundColor: '#FFCDD2' }),
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EF5350',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : undefined,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#f3f4f6',
    borderTopColor: '#6366f1',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? { animation: 'spin 1s linear infinite' } : {}),
  },
});

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(Platform.OS !== 'web');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS === 'web' && !showForm) {
    return (
      <div style={webStyles.container}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color:'#fff', textAlign:'center', padding:'40px' }}>
          <h1 style={{ fontSize:52, marginBottom:24 }}>Welcome to <span style={{ color:'#fffa' }}>ReciBook</span></h1>
          <p style={{ fontSize:22, maxWidth:600, marginBottom:40 }}>Discover, share and be inspired by delicious homemade recipes from people all around the world.</p>
          <button onClick={()=>setShowForm(true)} style={{ padding:'16px 32px', fontSize:20, borderRadius:12, border:'none', background:'#fff', color:'#4f46e5', cursor:'pointer', fontWeight:700, boxShadow:'0 8px 20px rgba(0,0,0,0.15)' }}>Log in / Sign up</button>
        </div>
      </div>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {Platform.OS === 'web' && (
        <TouchableOpacity style={{ position:'absolute', top:32, left:32 }} onPress={()=>setShowForm(false)}>
          <Text style={{ fontSize:24, color:'#6366f1' }}>←</Text>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>ReciBook</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}