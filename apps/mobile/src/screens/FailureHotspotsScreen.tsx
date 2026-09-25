import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TeacherFeedbackReport } from '../types/mobile';

interface FailureHotspotsScreenProps {
  report: TeacherFeedbackReport;
  onBack: () => void;
  isOffline?: boolean;
}

export const FailureHotspotsScreen: React.FC<FailureHotspotsScreenProps> = ({
  report,
  onBack,
  isOffline = false,
}) => {
  return (
    <View style={styles.container} testID="failure-hotspots-screen">
      {/* Banner Offline si corresponde */}
      {isOffline && (
        <View style={styles.offlineBanner} testID="hotspots-offline-banner">
          <Text style={styles.offlineText}>Visualizando reporte analítico desde base de datos SQLite local</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} testID="back-from-hotspots-btn">
          <Text style={styles.backButtonText}>← Volver a Cursos</Text>
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>Módulo de Feedback Docente (IA)</Text>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {report.courseTitle}
        </Text>
      </View>

      <FlatList
        data={report.hotspots}
        keyExtractor={(item, index) => `${item.concept}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          /* Resumen / Consejo Global de IA */
          <View style={styles.adviceCard} testID="overall-advice-card">
            <View style={styles.adviceHeader}>
              <View style={styles.sparkleIcon}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
              <Text style={styles.adviceTitle}>Diagnóstico Pedagógico de IA</Text>
            </View>
            <Text style={styles.adviceText}>{report.overallPedagogicalAdvice}</Text>
            <Text style={styles.adviceMeta}>
              Total evaluaciones analizadas: {report.totalAttemptsAnalyzed}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.hotspotCard} testID={`hotspot-card-${item.concept}`}>
            {/* Concepto y badge de frecuencia */}
            <View style={styles.conceptHeader}>
              <Text style={styles.conceptTitle}>{item.concept}</Text>
              <View style={styles.frequencyBadge}>
                <Text style={styles.frequencyText}>{item.failureFrequency} fallas</Text>
              </View>
            </View>

            <Text style={styles.affectedText}>
              Afecta a {item.affectedStudentsCount} estudiante(s) evaluados
            </Text>

            {/* Pregunta donde fallaron */}
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Pregunta de Referencia:</Text>
              <Text style={styles.questionText}>"{item.sampleQuestion}"</Text>
            </View>

            {/* Recomendación didáctica de la IA */}
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>Recomendación Didáctica:</Text>
              <Text style={styles.recommendationText}>
                {item.aiPedagogicalRecommendation}
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
  adviceCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 18,
    marginBottom: 20,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sparkleIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 14,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#c7d2fe',
  },
  adviceText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  adviceMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 10,
  },
  hotspotCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
    marginBottom: 16,
  },
  conceptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  conceptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f87171',
    flex: 1,
  },
  frequencyBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  frequencyText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: 'bold',
  },
  affectedText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 12,
  },
  questionBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  recommendationBox: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    padding: 12,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 20,
  },
});
