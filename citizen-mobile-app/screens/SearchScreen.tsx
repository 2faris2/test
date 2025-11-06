import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { searchBooks, clearSearchResults } from '../store/slices/booksSlice';
import { RootStackParamList } from '../navigation/types';
import BookCard from '../components/BookCard';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const theme = useTheme();

  const {
    searchResults,
    searchLoading,
    loading,
  } = useSelector((state: RootState) => state.books);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Recent searches (in a real app, this would be stored locally)
  const [recentSearches] = useState([
    'Ivo Andrić',
    'Travnik',
    'Bosanska historija',
    'Roman',
    'Dječije knjige',
  ]);

  // Popular searches
  const [popularSearches] = useState([
    'Na drini ćuprija',
    'Travnička hronika',
    'Sevdalinka',
    'Bosna i Hercegovina',
    'Omer-paša Latas',
  ]);

  const suggestedCategories = [
    { name: 'Istorija Bosne', icon: '📚' },
    { name: 'Lokalni autori', icon: '✍️' },
    { name: 'Dječija književnost', icon: '🧸' },
    { name: 'Biografije', icon: '👤' },
    { name: 'Putopisi', icon: '🗺️' },
    { name: 'Nauka', icon: '🔬' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      // Clear search results when screen is focused
      dispatch(clearSearchResults());
      setHasSearched(false);
      setSearchQuery('');
    }, [dispatch])
  );

  useEffect(() => {
    // Clear search timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      dispatch(clearSearchResults());
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    Keyboard.dismiss();

    dispatch(searchBooks({
      query: query.trim(),
      page: 1,
      limit: 20,
    }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search debounce (500ms)
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 500);

    setSearchTimeout(timeout);
  );

  const handleSearchSubmit = () => {
    performSearch(searchQuery);
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    performSearch(searchTerm);
  };

  const handleCategoryPress = (category: string) => {
    setSearchQuery(category);
    performSearch(category);
  };

  const navigateToBookDetail = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const renderBookItem = ({ item }: { item: any }) => (
    <BookCard
      book={item}
      onPress={() => navigateToBookDetail(item.id)}
      style={styles.bookItem}
    />
  );

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Text style={styles.recentSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: typeof suggestedCategories[0] }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.name)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptySearchState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>Nema rezultata</Text>
      <Text style={styles.emptyStateText}>
        Nismo našli knjige za "{searchQuery}"
      </Text>
      <Text style={styles.suggestionText}>
        Pokušajte sa drugim ključnim rečima ili proverite pravopis
      </Text>
    </View>
  );

  const renderInitialContent = () => (
    <View style={styles.initialContent}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nedavne pretrage</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item, index) => `recent-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Popular Searches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popularne pretrage</Text>
        <View style={styles.popularSearchesContainer}>
          {popularSearches.map((search, index) => (
            <Chip
              key={index}
              onPress={() => handleRecentSearchPress(search)}
              style={styles.popularSearchChip}
              compact
            >
              {search}
            </Chip>
          ))}
        </View>
      </View>

      {/* Suggested Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preporučene kategorije</Text>
        <FlatList
          data={suggestedCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    if (searchLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Pretraživanje...</Text>
        </View>
      );
    }

    if (hasSearched) {
      if (searchResults.length === 0) {
        return renderEmptySearchState();
      }
      return (
        <FlatList
          data={searchResults}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.searchResultsList}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return renderInitialContent();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Pretraži knjige, autore, žanrove..."
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          autoFocus
        />

        {hasSearched && (
          <Button
            mode="text"
            onPress={() => {
              dispatch(clearSearchResults());
              setHasSearched(false);
              setSearchQuery('');
            }}
            compact
            style={styles.clearButton}
          >
            Obriši
          </Button>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  initialContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 16,
  },
  recentSearchItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recentSearchText: {
    fontSize: 14,
    color: '#666',
  },
  popularSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularSearchChip: {
    backgroundColor: '#fff',
  },
  categoriesList: {
    paddingRight: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
  searchResultsList: {
    padding: 16,
  },
  bookItem: {
    margin: 4,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchScreen;