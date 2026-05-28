import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { API_BASE } from '../constants/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRegister() {
    if (!username.trim() || !password.trim() || !telefono.trim()) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }
    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          telefono: telefono.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Errore durante la registrazione.');
        return;
      }
      setSuccess('Account creato! Puoi ora accedere.');
      setTimeout(() => router.replace('/login'), 1500);
    } catch {
      setError('Impossibile raggiungere il server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>RC</Text>
          </View>
          <Text style={styles.title}>Registrati</Text>
          <Text style={styles.subtitle}>Crea un nuovo account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Scegli uno username"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 8 caratteri"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Telefono</Text>
          <TextInput
            style={styles.input}
            placeholder="Es. +39 333 1234567"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            value={telefono}
            onChangeText={setTelefono}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.successMsg}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crea account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.footerText}>Hai già un account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Accedi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 16,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMsg: {
    color: COLORS.success,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: COLORS.textMuted },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
