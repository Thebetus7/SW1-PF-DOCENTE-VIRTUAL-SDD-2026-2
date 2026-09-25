import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { CourseKpis } from '../types/mobile';

interface TeacherDashboardScreenProps {
  courses: CourseKpis[];
  onSelectCourseStudents: (courseId: string) => void;
  onSelectCourseHotspots: (courseId: string) => void;
  onRefresh?: () => void;
  isOffline?: boolean;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({
  courses,
  onSelectCourseStudents,
  onSelectCourseHotspots,
  isOffline = false,
}) => {
  return (
    <View style={styles.container} testID="teacher-dashboard-screen">
      {/* Banner de estado de conectividad */}
      {isOffline && (
        <View style={styles.offlineBanner} testID="offline-indicator">
          <Text style={styles.offlineText}>Modo Offline - Consultando datos en caché local</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Portal Docente</Text>
        <Text style={styles.headerTitle}>Rendimiento de Cursos</Text>
      </View>

      {/* Lista de Cursos con KPIs */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.courseId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`course-kpi-card-${item.courseId}`}>
            <Text style={styles.courseTitle}>{item.courseTitle}</Text>

            {/* Grid de KPIs */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Completitud</Text>
                <Text style={styles.kpiValue}>{item.completionRatePercentage}%</Text>
              </View>

              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Prom. Oral</Text>
                <Text style={[styles.kpiValue, { color: '#818cf8' }]}>
                  {item.averageOralScore} / 100
                </Text>
              </View>

              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Aprobación</Text>
                <Text style={[styles.kpiValue, { color: '#34d399' }]}>
                  {item.passRatePercentage}%
                </Text>
              </View>

              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>Alumnos</Text>
                <Text style={styles.kpiValue}>{item.totalStudentsEnrolled}</Text>
              </View>
            </View>

            {/* Acciones */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                testID={`view-students-btn-${item.courseId}`}
                style={styles.actionBtnSecondary}
                onPress={() => onSelectCourseStudents(item.courseId)}
              >
                <Text style={styles.btnSecondaryText}>Estudiantes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID={`view-hotspots-btn-${item.courseId}`}
                style={styles.actionBtnPrimary}
                onPress={() => onSelectCourseHotspots(item.courseId)}
              >
                <Text style={styles.btnPrimaryText}>Brechas IA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  offlineBanner: {
    backgroundColor: '#b45309',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fef3c7',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
