import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  useTheme,
} from 'react-native-paper';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
    available: boolean;
    rating: number;
    isNew: boolean;
    isPopular: boolean;
    genre: string;
  };
  onPress: () => void;
  style?: any;
  width?: number;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  style,
  width = 140,
}) => {
  const theme = useTheme();

  const getCoverImage = (): ImageSourcePropType => {
    if (book.coverImage) {
      return { uri: book.coverImage };
    }
    // Default book cover placeholder
    return require('../assets/default-book-cover.png');
  };

  const renderRatingStars = () => {
    const stars = [];
    const fullStars = Math.floor(book.rating);
    const hasHalfStar = book.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push('☆');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  return (
    <TouchableOpacity onPress={onPress} style={[{ width }, style]}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.coverContainer}>
            <Image
              source={getCoverImage()}
              style={[styles.coverImage, { width }]}
              resizeMode="cover"
              defaultSource={require('../assets/default-book-cover.png')}
            />

            {/* Overlay badges */}
            <View style={styles.badgesContainer}>
              {book.isNew && (
                <Chip mode="flat" compact style={styles.newBadge}>
                  NOVO
                </Chip>
              )}
              {book.isPopular && (
                <Chip mode="flat" compact style={styles.popularBadge}>
                  POPULARNO
                </Chip>
              )}
              {!book.available && (
                <Chip mode="flat" compact style={styles.unavailableBadge}>
                  NEDOSTUPNO
                </Chip>
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>

            <Text style={styles.author} numberOfLines={1}>
              {book.author}
            </Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                {renderRatingStars()} {book.rating.toFixed(1)}
              </Text>
            </View>

            <Text style={styles.genre} numberOfLines={1}>
              {book.genre}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 0,
  },
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 4,
  },
  newBadge: {
    backgroundColor: '#4caf50',
    marginBottom: 4,
  },
  popularBadge: {
    backgroundColor: '#ff9800',
    marginBottom: 4,
  },
  unavailableBadge: {
    backgroundColor: '#f44336',
  },
  infoContainer: {
    padding: 12,
    minHeight: 100,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#ffa000',
  },
  genre: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default BookCard;