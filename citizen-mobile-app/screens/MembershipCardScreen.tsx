import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Vibration,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';

const MembershipCardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRData();
  }, [user]);

  const generateQRData = () => {
    setLoading(true);

    if (!user) {
      setLoading(false);
      return;
    }

    // Generate QR code data according to the specification
    const qrCodeData = {
      type: "library_member",
      version: "1.0",
      data: {
        memberId: `TRV-${new Date().getFullYear()}-${user.id.slice(-5)}`,
        name: user.name,
        phone: user.phone,
        email: user.email,
        activeUntil: user.activeUntil,
        booksLimit: user.booksLimit,
        finesOwed: user.finesOwed,
        checksum: generateChecksum(user.id),
      }
    };

    setQrData(JSON.stringify(qrCodeData));
    setLoading(false);
  };

  const generateChecksum = (userId: string): string => {
    // Simple checksum generation - in production, use proper crypto
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).slice(0, 8);
  };

  const handleShareQR = async () => {
    if (!qrData) return;

    Vibration.vibrate(100);

    try {
      await Share.share({
        title: 'Bibliobus članska karta',
        message: 'Moja Bibliobus članska karta - skenirajte QR kod za identifikaciju',
      });
    } catch (error) {
      console.log('Share cancelled or failed');
    }
  };

  const handleRefresh = () => {
    generateQRData();
  };

  const getMembershipStatus = () => {
    if (!user?.activeUntil) return { status: 'Nepoznato', color: '#666', bgColor: '#f5f5f5' };

    const expiryDate = new Date(user.activeUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'Istekla', color: '#f44336', bgColor: '#ffebee' };
    } else if (daysUntilExpiry <= 30) {
      return { status: `Ističe za ${daysUntilExpiry} dana`, color: '#ff9800', bgColor: '#fff3e0' };
    } else {
      return { status: 'Aktivna', color: '#4caf50', bgColor: '#e8f5e8' };
    }
  };

  const membershipStatus = getMembershipStatus();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Generisanje QR koda...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Morate biti prijavljeni da biste videli člansku kartu</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Digitalna članska karta</Text>
          <Text style={styles.subtitle}>
            Vaša identifikacija u biblioteci
          </Text>
        </View>

        {/* Membership Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.libraryInfo}>
                <Text style={styles.libraryName}>Bibliobus Travnik</Text>
                <Text style={styles.librarySubtitle}>JU "Ivo Andrić"</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: membershipStatus.bgColor }
                ]}
              >
                <Text style={[styles.statusText, { color: membershipStatus.color }]}>
                  {membershipStatus.status}
                </Text>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Surface style={styles.qrSurface}>
                {qrData ? (
                  <QRCode
                    value={qrData}
                    size={200}
                    color="#000"
                    backgroundColor="#fff"
                    logoSize={60}
                    logoBackgroundColor="#fff"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderText}>QR kod</Text>
                  </View>
                )}
              </Surface>
              <Text style={styles.qrInstruction}>
                Prikažite ovaj kod bibliotekaru ili vozaču bibliobusa
              </Text>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Član:</Text>
                <Text style={styles.userValue}>{user.name}</Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>ID:</Text>
                <Text style={styles.userValue}>
                  TRV-{new Date().getFullYear()}-{user.id.slice(-5)}
                </Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Član od:</Text>
                <Text style={styles.userValue}>
                  {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'Nepoznato'}
                </Text>
              </View>
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Vazi do:</Text>
                <Text style={styles.userValue}>
                  {user.activeUntil ? new Date(user.activeUntil).toLocaleDateString() : 'Nepoznato'}
                </Text>
              </View>
            </View>

            {/* Limits */}
            <View style={styles.limits}>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Limit knjiga:</Text>
                <Text style={styles.limitValue}>{user.booksLimit}</Text>
              </View>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Kazne:</Text>
                <Text style={[
                  styles.limitValue,
                  user.finesOwed > 0 && styles.finesOwed
                ]}>
                  {user.finesOwed.toFixed(2)} KM
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text style={styles.instructionsTitle}>Kako koristiti člansku kartu</Text>
            <View style={styles.instructionList}>
              <Text style={styles.instructionItem}>
                📚 U biblioteci: Prikažite QR kod bibliotekaru prilikom uzimanja knjiga
              </Text>
              <Text style={styles.instructionItem}>
                🚌 Bibliobus: Skenirajte kod kod vozača prilikom preuzimanja rezervisanih knjiga
              </Text>
              <Text style={styles.instructionItem}>
                ✅ Verifikacija: QR kod sadrži sve vaše podatke za identifikaciju
              </Text>
              <Text style={styles.instructionItem}>
                🔒 Bezbednost: Kod je validan samo za vaš nalog i ne može se falsifikovati
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleShareQR}
            style={styles.shareButton}
            icon="share"
          >
            Podeli kartu
          </Button>
          <Button
            mode="contained"
            onPress={handleRefresh}
            style={styles.refreshButton}
            icon="refresh"
          >
            Osveži
          </Button>
        </View>

        {/* Contact Info */}
        <View style={styles.contact}>
          <Text style={styles.contactText}>
            Ukoliko imate problema sa kartom, kontaktirajte nas:
          </Text>
          <Text style={styles.contactDetails}>
            📞 +387 30 123 456 | 📧 bibliobus@travnik.ba
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 2,
  },
  librarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrSurface: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  userLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  userValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  limits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  limitItem: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  finesOwed: {
    color: '#f44336',
  },
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  instructionList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
  },
  refreshButton: {
    flex: 1,
  },
  contact: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactDetails: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MembershipCardScreen;