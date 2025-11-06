import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { getPopularBooks, getNewBooks } from '../store/slices/booksSlice';
import { fetchUserReservations } from '../store/slices/reservationsSlice';
import { fetchUserDeliveries } from '../store/slices/bibliobusSlice';
import { RootStackParamList } from '../navigation/types';
import BookCard from '../components/BookCard';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    popularBooks,
    newBooks,
    loading: booksLoading,
  } = useSelector((state: RootState) => state.books);
  const {
    activeReservations,
    loading: reservationsLoading,
  } = useSelector((state: RootState) => state.reservations);
  const {
    userDeliveries,
    loading: deliveriesLoading,
  } = useSelector((state: RootState) => state.bibliobus);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch, user?.id]);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        dispatch(getPopularBooks()),
        dispatch(getNewBooks()),
        dispatch(fetchUserReservations({ userId: user.id, active: true })),
        dispatch(fetchUserDeliveries(user.id)),
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToBookDetail = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const navigateToCatalog = () => {
    navigation.navigate('Catalog');
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const navigateToReservations = () => {
    navigation.navigate('Reservations');
  };

  const navigateToBibliobus = () => {
    navigation.navigate('Bibliobus');
  };

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const navigateToMembershipCard = () => {
    navigation.navigate('MembershipCard');
  };

  const activeDeliveries = userDeliveries.filter(
    delivery => delivery.status === 'SCHEDULED' || delivery.status === 'IN_TRANSIT'
  );

  if (booksLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Dobrodošli, {user?.name || 'Korisnik'}!
        </Text>
        <Text style={styles.subtitleText}>
          Šta biste danas da čitate?
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brze akcije</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToSearch}
          >
            <Surface style={styles.actionSurface}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Pretraga</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToCatalog}
          >
            <Surface style={styles.actionSurface}>
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>Katalog</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToMembershipCard}
          >
            <Surface style={styles.actionSurface}>
              <Text style={styles.actionIcon}>🎫</Text>
              <Text style={styles.actionText}>Članska karta</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToDashboard}
          >
            <Surface style={styles.actionSurface}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Statistika</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivne rezervacije</Text>
            <Button mode="text" onPress={navigateToReservations} compact>
              Pogledaj sve
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalList}>
              {activeReservations.slice(0, 3).map((reservation) => (
                <TouchableOpacity
                  key={reservation.id}
                  onPress={() => navigateToBookDetail(reservation.bookId)}
                >
                  <Card style={styles.reservationCard}>
                    <Card.Content>
                      <Text style={styles.reservationBookTitle} numberOfLines={2}>
                        {reservation.book.title}
                      </Text>
                      <Text style={styles.reservationAuthor}>
                        {reservation.book.author}
                      </Text>
                      <Chip
                        mode="outlined"
                        compact
                        style={styles.statusChip}
                      >
                        {reservation.status}
                      </Chip>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Active Deliveries */}
      {activeDeliveries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dostave na putu</Text>
            <Button mode="text" onPress={navigateToBibliobus} compact>
              Prati
            </Button>
          </View>
          {activeDeliveries.slice(0, 2).map((delivery) => (
            <Card key={delivery.id} style={styles.deliveryCard}>
              <Card.Content>
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryBookTitle}>
                      {delivery.reservation.book.title}
                    </Text>
                    <Text style={styles.deliveryLocation}>
                      📍 {delivery.busStop.name}
                    </Text>
                  </View>
                  <Chip
                    mode="flat"
                    compact
                    style={[
                      styles.deliveryStatusChip,
                      delivery.status === 'IN_TRANSIT' && styles.inTransitChip,
                    ]}
                  >
                    {delivery.status === 'SCHEDULED' ? 'Zakazano' : 'U dostavi'}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      {/* Popular Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popularne knjige</Text>
          <Button mode="text" onPress={navigateToCatalog} compact>
            Pogledaj sve
          </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalList}>
            {popularBooks.slice(0, 5).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() => navigateToBookDetail(book.id)}
                style={styles.bookCard}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* New Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nove knjige</Text>
          <Button mode="text" onPress={navigateToCatalog} compact>
            Pogledaj sve
          </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalList}>
            {newBooks.slice(0, 5).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() => navigateToBookDetail(book.id)}
                style={styles.bookCard}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1976d2',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionSurface: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  horizontalList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  bookCard: {
    width: 120,
    marginRight: 12,
  },
  reservationCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#fff3e0',
  },
  reservationBookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reservationAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  deliveryCard: {
    marginBottom: 8,
    backgroundColor: '#e8f5e8',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deliveryLocation: {
    fontSize: 14,
    color: '#666',
  },
  deliveryStatusChip: {
    backgroundColor: '#4caf50',
  },
  inTransitChip: {
    backgroundColor: '#ff9800',
  },
});

export default HomeScreen;