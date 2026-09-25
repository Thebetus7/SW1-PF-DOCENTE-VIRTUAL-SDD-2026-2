import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StudentOralSummary } from '../types/mobile';

interface CourseStudentsScreenProps {
  courseTitle: string;
  students: StudentOralSummary[];
  onBack: () => void;
}

export const CourseStudentsScreen: React.FC<CourseStudentsScreenProps> = ({
  courseTitle,
  students,
  onBack,
}) => {
  return (
    <View style={styles.container} testID="course-students-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-to-dashboard-btn">
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>Estudiantes Evaluados</Text>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {courseTitle}
        </Text>
      </View>

      {/* Lista de Estudiantes */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.attemptId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay evaluaciones registradas en este curso aún.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.studentCard} testID={`student-item-${item.studentId}`}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.studentEmail}>{item.studentEmail}</Text>
              <Text style={styles.dateText}>
                Completado: {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.scoreBadge}>
              <Text
                style={[
                  styles.scoreValue,
                  { color: item.passed ? '#34d399' : '#f87171' },
                ]}
              >
                {item.score}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  { color: item.passed ? '#34d399' : '#f87171' },
                ]}
              >
                {item.passed ? 'Aprobado' : 'Reprobado'}
              </Text>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'black',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
