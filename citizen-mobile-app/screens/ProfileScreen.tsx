import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  List,
  Button,
  Avatar,
  Card,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { RootStackParamList } from '../navigation/types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Da li ste sigurni da se želite odjaviti?',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Odjavi se',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToMembershipCard = () => {
    navigation.navigate('MembershipCard');
  };

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const navigateToReservations = () => {
    navigation.navigate('Reservations');
  };

  const navigateToReadingHistory = () => {
    // This would navigate to a reading history screen
    console.log('Navigate to reading history');
  };

  const navigateToEditProfile = () => {
    // This would navigate to an edit profile screen
    console.log('Navigate to edit profile');
  };

  const navigateToNotifications = () => {
    // This would navigate to notifications settings
    console.log('Navigate to notifications');
  };

  const navigateToHelp = () => {
    Alert.alert(
      'Pomoć i podrška',
      'Za pomoć i podršku kontaktirajte nas:\n\n' +
      '📞 Telefon: +387 30 123 456\n' +
      '📧 Email: bibliobus@travnik.ba\n' +
      '🕐 Radno vrijeme: Pon-Pet 8:00-16:00\n\n' +
      'Adresa:\n' +
      'JU "Ivo Andrić" Travnik\n' +
      'Trg heroja 1\n' +
      '72270 Travnik',
      [{ text: 'OK' }]
    );
  };

  const navigateToAbout = () => {
    Alert.alert(
      'O Bibliobus aplikaciji',
      'Bibliobus Travnik v1.0.0\n\n' +
      'Digitalna biblioteka za ruralna područja\n\n' +
      '© 2024 JU "Ivo Andrić" Travnik\n' +
      'Sva prava zadržana.\n\n' +
      'Razvijeno sa ❤️ za građane Travnika',
      [{ text: 'OK' }]
    );
  };

  const getMembershipStatus = () => {
    if (!user?.activeUntil) return { text: 'Nepoznato', color: '#666' };

    const expiryDate = new Date(user.activeUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { text: 'Istekla', color: '#f44336' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Ističe za ${daysUntilExpiry} dana`, color: '#ff9800' };
    } else {
      return { text: `Aktivna do ${expiryDate.toLocaleDateString()}`, color: '#4caf50' };
    }
  };

  const membershipStatus = getMembershipStatus();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Korisnik'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.phone}>{user?.phone}</Text>
              <View style={styles.membershipStatus}>
                <Text style={styles.memberSince}>
                  Član od {user?.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'Nepoznato'}
                </Text>
                <Text style={[styles.statusText, { color: membershipStatus.color }]}>
                  {membershipStatus.text}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={navigateToDashboard}
          >
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>📊</Text>
            </View>
            <Text style={styles.statLabel}>Statistika</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={navigateToReservations}
          >
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>📚</Text>
            </View>
            <Text style={styles.statLabel}>Rezervacije</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={navigateToMembershipCard}
          >
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>🎫</Text>
            </View>
            <Text style={styles.statLabel}>Članska karta</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <Card.Content>
            <List.Section>
              <List.Item
                title="Izmeni profil"
                description="Ažurirajte svoje podatke"
                left={(props) => <List.Icon {...props} icon="account-edit" />}
                onPress={navigateToEditProfile}
              />
              <Divider />
              <List.Item
                title="Istorija čitanja"
                description="Pregledajte pročitane knjige"
                left={(props) => <List.Icon {...props} icon="history" />}
                onPress={navigateToReadingHistory}
              />
              <Divider />
              <List.Item
                title="Obaveštenja"
                description="Podešavanja notifikacija"
                left={(props) => <List.Icon {...props} icon="bell" />}
                onPress={navigateToNotifications}
              />
              <Divider />
              <List.Item
                title="Pomoć i podrška"
                description="Kontakt i tehnička podrška"
                left={(props) => <List.Icon {...props} icon="help-circle" />}
                onPress={navigateToHelp}
              />
              <Divider />
              <List.Item
                title="O aplikaciji"
                description="Informacije o verziji i autorima"
                left={(props) => <List.Icon {...props} icon="information" />}
                onPress={navigateToAbout}
              />
            </List.Section>
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            onPress={navigateToEditProfile}
            style={styles.editButton}
            icon="account-edit"
          >
            Izmeni profil
          </Button>

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            buttonColor="#f44336"
          >
            Odjavi se
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bibliobus Travnik
          </Text>
          <Text style={styles.footerSubtext}>
            Povezujemo ljude i knjige
          </Text>
        </View>
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
  profileCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  membershipStatus: {
    marginTop: 8,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    borderColor: '#1976d2',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;