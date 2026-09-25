import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MobileBackendStatusBadge } from './src/components/MobileBackendStatusBadge';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* CUADRO VISUAL DE RECONOCIMIENTO DEL BACKEND EN TIEMPO REAL */}
      <MobileBackendStatusBadge />

      <View style={styles.header}>
        <Text style={styles.badge}>Panel Docente</Text>
        <Text style={styles.title}>Analítica y Feedback</Text>
        <Text style={styles.subtitle}>
          Monitoreo de rendimiento estudiantil y detección de brechas conceptuales.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Modo Offline-First</Text>
        <Text style={styles.cardText}>
          Las métricas se almacenan localmente en SQLite para consulta sin conexión.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  badge: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
});
