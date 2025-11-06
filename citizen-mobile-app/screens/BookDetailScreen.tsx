import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  useTheme,
  ActivityIndicator,
  Surface,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { getBookDetails, clearSelectedBook } from '../store/slices/booksSlice';
import { createReservation } from '../store/slices/reservationsSlice';
import { RootStackParamList } from '../navigation/types';

type BookDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BookDetail'>;
type BookDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;

const BookDetailScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<BookDetailScreenNavigationProp>();
  const route = useRoute<BookDetailScreenRouteProp>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedBook, loading, error } = useSelector((state: RootState) => state.books);
  const { creatingReservation } = useSelector((state: RootState) => state.reservations);

  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'LIBRARY' | 'BIBLIOBUS'>('LIBRARY');
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  const { bookId } = route.params;

  useEffect(() => {
    dispatch(getBookDetails(bookId));

    return () => {
      dispatch(clearSelectedBook());
    };
  }, [dispatch, bookId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Greška', error, [{ text: 'OK' }]);
    }
  }, [error]);

  const handleReserveBook = () => {
    if (!user) {
      Alert.alert('Greška', 'Morate biti prijavljeni da biste rezervisali knjigu');
      return;
    }

    if (!selectedBook?.available) {
      Alert.alert('Greška', 'Ova knjiga trenutno nije dostupna');
      return;
    }

    if (user.finesOwed > 0) {
      Alert.alert('Greška', 'Imate neplaćene kazne. Molimo ih rešite pre nove rezervacije.');
      return;
    }

    if (user.booksLimit <= 0) {
      Alert.alert('Greška', 'Dostigli ste maksimalni broj posuđenih knjiga');
      return;
    }

    setShowReservationModal(true);
  };

  const confirmReservation = async () => {
    if (selectedLocation === 'BIBLIOBUS' && !selectedStop) {
      Alert.alert('Greška', 'Morate izabrati stanicu za bibliobus dostavu');
      return;
    }

    try {
      await dispatch(createReservation({
        bookId: selectedBook!.id,
        deliveryLocation: {
          type: selectedLocation,
          busStopId: selectedLocation === 'BIBLIOBUS' ? selectedStop : undefined,
        },
      })).unwrap();

      setShowReservationModal(false);
      Alert.alert(
        'Uspeh!',
        'Knjiga je uspešno rezervisana. Bićete obavešteni kada bude spremna za preuzimanje.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Greška', error || 'Neuspela rezervacija');
    }
  };

  const handleShareBook = async () => {
    if (!selectedBook) return;

    try {
      await Share.share({
        title: selectedBook.title,
        message: `Pogledaj ovu knjigu: ${selectedBook.title} od ${selectedBook.author}\n\nDostupna u Bibliobus Travnik aplikaciji!`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const renderRatingStars = () => {
    if (!selectedBook) return null;

    const stars = [];
    const fullStars = Math.floor(selectedBook.rating);
    const hasHalfStar = selectedBook.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push('⭐');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }

    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingStars}>{stars.join('')}</Text>
        <Text style={styles.ratingText}>{selectedBook.rating.toFixed(1)} ({selectedBook.timesBorrowed} puta)</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Učitavanje detalja knjige...</Text>
      </View>
    );
  }

  if (!selectedBook) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Knjiga nije pronađena</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Nazad
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Book Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.bookInfo}>
              <Text style={styles.title}>{selectedBook.title}</Text>
              <Text style={styles.author}>od {selectedBook.author}</Text>

              {renderRatingStars()}

              <View style={styles.bookMeta}>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.genreChip}
                >
                  {selectedBook.genre}
                </Chip>
                <Chip
                  mode="outlined"
                  compact
                  style={styles.languageChip}
                >
                  {selectedBook.language}
                </Chip>
              </View>

              <View style={styles.availabilityContainer}>
                <Chip
                  mode="flat"
                  style={[
                    styles.availabilityChip,
                    selectedBook.available ? styles.availableChip : styles.unavailableChip,
                  ]}
                >
                  {selectedBook.available ? '✅ Dostupna' : '❌ Nedostupna'}
                </Chip>
                <Text style={styles.copiesText}>
                  {selectedBook.availableCopies} od {selectedBook.totalCopies} kopija
                </Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Chip
                mode="outlined"
                style={styles.locationChip}
              >
                📍 {selectedBook.location === 'LIBRARY' ? '📚 Biblioteka' : '🚌 Bibliobus'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Book Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Detalji o knjizi</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ISBN:</Text>
              <Text style={styles.detailValue}>{selectedBook.isbn}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Izdavač:</Text>
              <Text style={styles.detailValue}>{selectedBook.publisher}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Godina izdanja:</Text>
              <Text style={styles.detailValue}>{selectedBook.publicationYear}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Broj stranica:</Text>
              <Text style={styles.detailValue}>{selectedBook.pages}</Text>
            </View>

            {selectedBook.isNew && (
              <Chip mode="flat" compact style={styles.newBadge}>
                🆕 Nova knjiga
              </Chip>
            )}

            {selectedBook.isPopular && (
              <Chip mode="flat" compact style={styles.popularBadge}>
                🔥 Popularno
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Opis</Text>
            <Text style={styles.description}>
              {selectedBook.description || 'Nema opisa za ovu knjigu.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleReserveBook}
            loading={creatingReservation}
            disabled={!selectedBook.available || creatingReservation}
            style={styles.reserveButton}
            contentStyle={styles.buttonContent}
          >
            {creatingReservation ? 'Rezervišem...' : 'Rezerviši knjigu'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleShareBook}
            style={styles.shareButton}
            icon="share"
          >
          </Button>
        </View>

        {/* Reservation Modal */}
        {showReservationModal && (
          <Surface style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Izaberite mesto preuzimanja</Text>

              <Text style={styles.locationTitle}>Gde želite da preuzmete knjigu?</Text>

              <View style={styles.locationOptions}>
                <Button
                  mode={selectedLocation === 'LIBRARY' ? 'contained' : 'outlined'}
                  onPress={() => {
                    setSelectedLocation('LIBRARY');
                    setSelectedStop(null);
                  }}
                  style={styles.locationOption}
                  icon="library"
                >
                  📚 U biblioteci
                </Button>

                <Button
                  mode={selectedLocation === 'BIBLIOBUS' ? 'contained' : 'outlined'}
                  onPress={() => setSelectedLocation('BIBLIOBUS')}
                  style={styles.locationOption}
                  icon="bus"
                >
                  🚌 Bibliobus dostava
                </Button>
              </View>

              {selectedLocation === 'BIBLIOBUS' && (
                <View style={styles.busStopSelection}>
                  <Text style={styles.busStopTitle}>Izaberite stanicu:</Text>
                  {/* In a real app, this would be a list of available bus stops */}
                  <Text style={styles.busStopNote}>
                    Stanice će biti dostupne nakon izbora bibliobus rute
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowReservationModal(false)}
                  style={styles.cancelButton}
                >
                  Otkaži
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmReservation}
                  disabled={selectedLocation === 'BIBLIOBUS' && !selectedStop}
                  style={styles.confirmButton}
                >
                  Potvrdi rezervaciju
                </Button>
              </View>
            </View>
          </Surface>
        )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    padding: 20,
  },
  bookInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 32,
  },
  author: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStars: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  bookMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  genreChip: {
    backgroundColor: '#e3f2fd',
  },
  languageChip: {
    backgroundColor: '#f3e5f5',
  },
  availabilityContainer: {
    alignItems: 'flex-start',
  },
  availabilityChip: {
    marginBottom: 8,
  },
  availableChip: {
    backgroundColor: '#4caf50',
  },
  unavailableChip: {
    backgroundColor: '#f44336',
  },
  copiesText: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    marginTop: 8,
  },
  locationChip: {
    backgroundColor: '#fff3e0',
  },
  detailsCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  newBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#4caf50',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#ff9800',
  },
  descriptionCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  reserveButton: {
    flex: 1,
  },
  shareButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    paddingVertical: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  locationOptions: {
    gap: 12,
    marginBottom: 16,
  },
  locationOption: {
    paddingVertical: 8,
  },
  busStopSelection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  busStopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  busStopNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default BookDetailScreen;