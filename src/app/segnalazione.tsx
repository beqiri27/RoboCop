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
  Image,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { API_BASE } from '../constants/api';
import { useAuth } from '../context/AuthContext';

type Criticita = 'bassa' | 'media' | 'alta';
type Tipologia =
  | 'Sicurezza e Ordine Pubblico'
  | 'Viabilità e Mobilità'
  | 'Degrado e Manutenzione Urbana'
  | 'Emergenze e Infrastrutture'
  | 'altro';

const CRITICITA_OPTIONS: { value: Criticita; label: string }[] = [
  { value: 'bassa', label: 'Bassa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

const TIPOLOGIA_OPTIONS: { value: Tipologia; label: string; icon: string }[] = [
  { value: 'Sicurezza e Ordine Pubblico', label: 'Sicurezza', icon: '🛡️' },
  { value: 'Viabilità e Mobilità', label: 'Viabilità', icon: '🚗' },
  { value: 'Degrado e Manutenzione Urbana', label: 'Degrado', icon: '🏚️' },
  { value: 'Emergenze e Infrastrutture', label: 'Emergenze', icon: '⚡' },
  { value: 'altro', label: 'Altro', icon: '📋' },
];

export default function SegnalazioneScreen() {
  const { user, logout } = useAuth();

  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [criticita, setCriticita] = useState<Criticita>('bassa');
  const [tipologia, setTipologia] = useState<Tipologia>('Sicurezza e Ordine Pubblico');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleInvia() {
    if (!nome.trim() || !descrizione.trim()) {
      setError('Nome e descrizione sono obbligatori.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/segnalazione`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_utente: user?.id,
          nome: nome.trim(),
          descrizione: descrizione.trim(),
          criticita,
          tipologia,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'invio.");
        return;
      }
      setSuccess('Segnalazione inviata con successo!');
      setNome('');
      setDescrizione('');
      setCriticita('bassa');
      setTipologia('Sicurezza e Ordine Pubblico');
    } catch {
      setError('Impossibile raggiungere il server.');
    } finally {
      setLoading(false);
    }
  }

  const criticaColor: Record<Criticita, string> = {
    bassa: COLORS.bassa,
    media: COLORS.media,
    alta: COLORS.alta,
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={require('./assets/robocop-logo-navbar.png')}
            style={styles.navLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.topBarTitle}>Nuova Segnalazione</Text>
            {user ? (
              <Text style={styles.topBarSub}>Ciao, {user.username}</Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => { await logout(); }}
        >
          <Text style={styles.logoutText}>Esci</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder per la mappa Mapbox */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>📍 Mappa — prossimamente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nome segnalazione</Text>
          <TextInput
            style={styles.input}
            placeholder="Es. Buca nella strada"
            placeholderTextColor={COLORS.textMuted}
            value={nome}
            onChangeText={setNome}
            maxLength={30}
          />

          <Text style={styles.label}>Tipologia</Text>
          <View style={styles.tipologiaGrid}>
            {TIPOLOGIA_OPTIONS.map((opt) => {
              const selected = tipologia === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.tipologiaChip, selected && styles.tipologiaChipSelected]}
                  onPress={() => setTipologia(opt.value)}
                >
                  <Text style={styles.tipologiaIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.tipologiaLabel,
                      selected && styles.tipologiaLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Descrizione</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Descrivi il problema nel dettaglio..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={descrizione}
            onChangeText={setDescrizione}
          />

          <Text style={styles.label}>Criticità</Text>
          <View style={styles.criticaRow}>
            {CRITICITA_OPTIONS.map((opt) => {
              const selected = criticita === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.criticaChip,
                    { borderColor: criticaColor[opt.value] },
                    selected && { backgroundColor: criticaColor[opt.value] },
                  ]}
                  onPress={() => setCriticita(opt.value)}
                >
                  <Text
                    style={[
                      styles.criticaLabel,
                      { color: selected ? '#fff' : criticaColor[opt.value] },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.successMsg}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleInvia}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Invia segnalazione</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navLogo: {
    width: 36,
    height: 36,
  },
  topBarTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  topBarSub: { color: COLORS.primaryLight, fontSize: 12, marginTop: 1 },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 16,
  },
  textarea: {
    height: 90,
    paddingTop: 11,
  },
  tipologiaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tipologiaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
  },
  tipologiaChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  tipologiaIcon: { fontSize: 14 },
  tipologiaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tipologiaLabelSelected: {
    color: COLORS.primary,
  },
  criticaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  criticaChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  criticaLabel: { fontSize: 14, fontWeight: '700' },
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
