import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MobileUser } from '../types/mobile';

interface MobileRoleGuardProps {
  user: MobileUser | null;
  children: React.ReactNode;
  onLogout?: () => void;
}

export const MobileRoleGuard: React.FC<MobileRoleGuardProps> = ({
  user,
  children,
  onLogout,
}) => {
  if (!user) {
    return (
      <View style={styles.container} testID="mobile-unauthenticated-view">
        <Text style={styles.title}>Inicia Sesión</Text>
        <Text style={styles.subtitle}>Ingresa con tu cuenta de docente o administrador.</Text>
      </View>
    );
  }

  // RESTRICCIÓN ESTRICTA: Los estudiantes NO tienen acceso a la app móvil (HU-10, RF-03, ESC-10)
  if (user.role === 'STUDENT') {
    return (
      <View style={styles.container} testID="mobile-role-restricted-view">
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✕</Text>
        </View>
        <Text style={styles.restrictedTitle}>Acceso Exclusivo Docente</Text>
        <Text style={styles.restrictedMessage}>
          Esta aplicación móvil está diseñada exclusivamente para profesores y administradores.
          Como estudiante, ingresa a la plataforma web para realizar tus lecciones, preevaluación y exámenes con el Docente Virtual 3D.
        </Text>
        {onLogout && (
          <TouchableOpacity
            testID="mobile-logout-button"
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // TEACHER o ADMIN: Acceso permitido
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: '#ef4444',
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 12,
  },
  restrictedMessage: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
