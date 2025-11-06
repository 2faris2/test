import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { booksAPI } from '../services/api';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  coverImage?: string;
  publisher: string;
  publicationYear: number;
  pages: number;
  language: string;
  available: boolean;
  location: 'LIBRARY' | 'BIBLIOBUS';
  totalCopies: number;
  availableCopies: number;
  rating: number;
  timesBorrowed: number;
  isNew: boolean;
  isPopular: boolean;
}

interface BooksState {
  catalog: Book[];
  searchResults: Book[];
  selectedBook: Book | null;
  popularBooks: Book[];
  newBooks: Book[];
  loading: boolean;
  error: string | null;
  searchLoading: boolean;
  filters: {
    genre?: string;
    available?: boolean;
    location?: 'LIBRARY' | 'BIBLIOBUS';
    language?: string;
  };
}

const initialState: BooksState = {
  catalog: [],
  searchResults: [],
  selectedBook: null,
  popularBooks: [],
  newBooks: [],
  loading: false,
  error: null,
  searchLoading: false,
  filters: {},
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    available?: boolean;
    location?: 'LIBRARY' | 'BIBLIOBUS';
  }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBooks(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch books');
    }
  }
);

export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async (params: {
    query: string;
    genre?: string;
    available?: boolean;
    location?: 'LIBRARY' | 'BIBLIOBUS';
    page?: number;
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.searchBooks(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Search failed');
    }
  }
);

export const getBookDetails = createAsyncThunk(
  'books/getBookDetails',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookById(bookId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch book details');
    }
  }
);

export const getPopularBooks = createAsyncThunk(
  'books/getPopularBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getPopularBooks();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch popular books');
    }
  }
);

export const getNewBooks = createAsyncThunk(
  'books/getNewBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getNewBooks();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch new books');
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
    setFilters: (state, action: PayloadAction<Partial<BooksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload.books;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Books
      .addCase(searchBooks.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.books;
        state.error = null;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      })
      // Get Book Details
      .addCase(getBookDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBook = action.payload;
        state.error = null;
      })
      .addCase(getBookDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Popular Books
      .addCase(getPopularBooks.fulfilled, (state, action) => {
        state.popularBooks = action.payload.books;
      })
      .addCase(getPopularBooks.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Get New Books
      .addCase(getNewBooks.fulfilled, (state, action) => {
        state.newBooks = action.payload.books;
      })
      .addCase(getNewBooks.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedBook, setFilters, clearFilters, clearSearchResults } = booksSlice.actions;
export default booksSlice.reducer;