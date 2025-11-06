import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Button,
  FAB,
  useTheme,
  ActivityIndicator,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { fetchBooks, setFilters, clearFilters } from '../store/slices/booksSlice';
import { RootStackParamList } from '../navigation/types';
import BookCard from '../components/BookCard';

type CatalogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Catalog'>;

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    genre?: string;
    location?: 'LIBRARY' | 'BIBLIOBUS';
    available?: boolean;
  }) => void;
  currentFilters: {
    genre?: string;
    location?: 'LIBRARY' | 'BIBLIOBUS';
    available?: boolean;
  };
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState(currentFilters);
  const theme = useTheme();

  const genres = [
    'Roman',
    'Biografija',
    'Istorija',
    'Nauka',
    'Dječija knjiga',
    'Putopis',
    'Poezija',
    'Drama',
    'Filozofija',
    'Religija',
  ];

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      genre: undefined,
      location: undefined,
      available: undefined,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filteri</Text>

          {/* Genre Filter */}
          <Text style={styles.filterSectionTitle}>Žanr</Text>
          <View style={styles.genreContainer}>
            {genres.map((genre) => (
              <Chip
                key={genre}
                selected={filters.genre === genre}
                onPress={() =>
                  setFilters(prev => ({
                    ...prev,
                    genre: prev.genre === genre ? undefined : genre,
                  }))
                }
                style={styles.genreChip}
                compact
              >
                {genre}
              </Chip>
            ))}
          </View>

          {/* Location Filter */}
          <Text style={styles.filterSectionTitle}>Lokacija</Text>
          <View style={styles.locationContainer}>
            <Chip
              selected={filters.location === 'LIBRARY'}
              onPress={() =>
                setFilters(prev => ({
                  ...prev,
                  location: prev.location === 'LIBRARY' ? undefined : 'LIBRARY',
                }))
              }
              style={styles.locationChip}
              compact
            >
              📚 Biblioteka
            </Chip>
            <Chip
              selected={filters.location === 'BIBLIOBUS'}
              onPress={() =>
                setFilters(prev => ({
                  ...prev,
                  location: prev.location === 'BIBLIOBUS' ? undefined : 'BIBLIOBUS',
                }))
              }
              style={styles.locationChip}
              compact
            >
              🚌 Bibliobus
            </Chip>
          </View>

          {/* Availability Filter */}
          <Text style={styles.filterSectionTitle}>Dostupnost</Text>
          <View style={styles.availabilityContainer}>
            <Chip
              selected={filters.available === true}
              onPress={() =>
                setFilters(prev => ({
                  ...prev,
                  available: prev.available === true ? undefined : true,
                }))
              }
              style={styles.availabilityChip}
              compact
            >
              ✅ Dostupno
            </Chip>
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.resetButton}
              compact
            >
              Resetuj
            </Button>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.applyButton}
              compact
            >
              Primeni
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const CatalogScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CatalogScreenNavigationProp>();
  const theme = useTheme();

  const {
    catalog,
    loading,
    filters,
  } = useSelector((state: RootState) => state.books);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    loadBooks();
  }, [dispatch, filters]);

  const loadBooks = async () => {
    await dispatch(fetchBooks(filters));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search API call
  };

  const handleFilterPress = () => {
    setFiltersModalVisible(true);
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setActiveFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    dispatch(clearFilters());
  };

  const navigateToBookDetail = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const hasActiveFilters = activeFilters.genre || activeFilters.location || activeFilters.available;

  const renderBookItem = ({ item }: { item: any }) => (
    <BookCard
      book={item}
      onPress={() => navigateToBookDetail(item.id)}
      style={styles.bookItem}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nema knjiga</Text>
      <Text style={styles.emptyStateText}>
        Pokušajte da promenite filtere ili pretragu
      </Text>
      {hasActiveFilters && (
        <Button
          mode="outlined"
          onPress={handleClearFilters}
          style={styles.clearFiltersButton}
        >
          Ukloni filtere
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Pretraži knjige..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />

        <Button
          mode="outlined"
          onPress={handleFilterPress}
          style={[
            styles.filterButton,
            hasActiveFilters && styles.activeFilterButton,
          ]}
          compact
        >
          Filteri {hasActiveFilters && '•'}
        </Button>
      </View>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Aktivni filteri:</Text>
          <View style={styles.activeFiltersList}>
            {activeFilters.genre && (
              <Chip mode="flat" compact style={styles.activeFilterChip}>
                Žanr: {activeFilters.genre}
              </Chip>
            )}
            {activeFilters.location && (
              <Chip mode="flat" compact style={styles.activeFilterChip}>
                {activeFilters.location === 'LIBRARY' ? '📚 Biblioteka' : '🚌 Bibliobus'}
              </Chip>
            )}
            {activeFilters.available && (
              <Chip mode="flat" compact style={styles.activeFilterChip}>
                ✅ Dostupno
              </Chip>
            )}
          </View>
        </View>
      )}

      {/* Books List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Učitavanje kataloga...</Text>
        </View>
      ) : (
        <FlatList
          data={catalog}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Scroll to Top FAB */}
      <FAB
        icon="arrow-up"
        style={styles.fab}
        onPress={() => {
          // Scroll to top functionality would be implemented here
        }}
      />

      {/* Filters Modal */}
      <FiltersModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    marginBottom: 8,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    alignSelf: 'flex-start',
  },
  activeFilterButton: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  activeFiltersContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    backgroundColor: '#e3f2fd',
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    margin: 4,
    flex: 1,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  genreChip: {
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  locationChip: {
    flex: 1,
  },
  availabilityContainer: {
    marginBottom: 20,
  },
  availabilityChip: {
    alignSelf: 'flex-start',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default CatalogScreen;