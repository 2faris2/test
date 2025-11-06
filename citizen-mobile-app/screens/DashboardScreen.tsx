import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);

  // Mock statistics - in a real app, this would come from API
  const stats = {
    totalBooksRead: 12,
    currentBooksLoaned: 2,
    favoriteGenres: [
      { name: 'Roman', count: 5 },
      { name: 'Istorija', count: 3 },
      { name: 'Biografija', count: 2 },
      { name: 'Dječija knjiga', count: 2 },
    ],
    readingStreak: 7, // days
    memberSince: user?.memberSince || new Date().toISOString(),
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Učitavanje podataka...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Moja statistika</Text>
          <Text style={styles.subtitle}>
            Pratite svoje čitalačke navike
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalBooksRead}</Text>
            <Text style={styles.statLabel}>Pročitano knjiga</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.currentBooksLoaned}</Text>
            <Text style={styles.statLabel}>Trenutno posuđeno</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.readingStreak}</Text>
            <Text style={styles.statLabel}>Dani uzastopno</Text>
          </Surface>
        </View>

        {/* Reading Progress */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Čitalački progres</Text>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Član od</Text>
              <Text style={styles.progressValue}>
                {new Date(stats.memberSince).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Prosečno mesečno</Text>
              <Text style={styles.progressValue}>1.2 knjige</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Omiljena lokacija</Text>
              <Text style={styles.progressValue}>📚 Biblioteka</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Favorite Genres */}
        <Card style={styles.genresCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Omiljeni žanrovi</Text>
            {stats.favoriteGenres.map((genre, index) => (
              <View key={index} style={styles.genreItem}>
                <Text style={styles.genreName}>{genre.name}</Text>
                <Text style={styles.genreCount}>{genre.count} knjiga</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Značke i dostignuća</Text>
            <View style={styles.achievementsList}>
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>🏆</Text>
                <Text style={styles.achievementText}>Mjesečni čitalac</Text>
              </View>
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>📚</Text>
                <Text style={styles.achievementText}>Ljubitelj romana</Text>
              </View>
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>🔄</Text>
                <Text style={styles.achievementText}>{stats.readingStreak} dana uzastopno</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  genresCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  achievementsCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  genreName: {
    fontSize: 16,
    color: '#333',
  },
  genreCount: {
    fontSize: 16,
    color: '#666',
  },
  achievementsList: {
    gap: 12,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default DashboardScreen;