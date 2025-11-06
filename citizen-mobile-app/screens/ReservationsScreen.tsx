import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUserReservations, cancelReservation } from '../store/slices/reservationsSlice';

const ReservationsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    activeReservations,
    loading,
    error,
  } = useSelector((state: RootState) => state.reservations);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserReservations({ userId: user.id, active: true }));
    }
  }, [dispatch, user?.id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Učitavanje rezervacija...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {
            if (user?.id) {
              dispatch(fetchUserReservations({ userId: user.id, active: true }));
            }
          }} />
        }
      >
        <Text style={styles.title}>Moje rezervacije</Text>

        {activeReservations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Nemate aktivnih rezervacija
              </Text>
              <Button mode="contained" style={styles.browseButton}>
                Pregledaj katalog
              </Button>
            </Card.Content>
          </Card>
        ) : (
          activeReservations.map((reservation) => (
            <Card key={reservation.id} style={styles.reservationCard}>
              <Card.Content>
                <Text style={styles.bookTitle}>{reservation.book.title}</Text>
                <Text style={styles.bookAuthor}>{reservation.book.author}</Text>
                <Chip mode="outlined" compact style={styles.statusChip}>
                  {reservation.status}
                </Chip>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    marginTop: 16,
  },
  reservationCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
});

export default ReservationsScreen;