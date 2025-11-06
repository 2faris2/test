import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  List,
  Divider,
  useTheme,
  ActivityIndicator,
  Surface,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../store';
import {
  fetchBusStops,
  fetchBusRoutes,
  fetchUserDeliveries,
  setSelectedRoute,
  setSelectedStop,
} from '../store/slices/bibliobusSlice';
import { RootStackParamList } from '../navigation/types';

type BibliobusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bibliobus'>;

interface BusRouteCardProps {
  route: any;
  onPress: () => void;
}

const BusRouteCard: React.FC<BusRouteCardProps> = ({ route, onPress }) => {
  const theme = useTheme();

  const getDayOfWeek = (day: string) => {
    const days: { [key: string]: string } = {
      MONDAY: 'Ponedjeljak',
      WEDNESDAY: 'Srijeda',
      FRIDAY: 'Petak',
    };
    return days[day] || day;
  };

  const getStopsDisplay = (stops: any[]) => {
    if (stops.length <= 2) {
      return stops.map(stop => stop.name).join(', ');
    }
    return `${stops[0].name}, +${stops.length - 1} stanica`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.routeCard}>
      <Surface style={styles.routeSurface}>
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routeDay}>{getDayOfWeek(route.dayOfWeek)}</Text>
          </View>
          <Chip
            mode="flat"
            compact
            style={[
              styles.routeStatusChip,
              route.active ? styles.activeChip : styles.inactiveChip,
            ]}
          >
            {route.active ? 'Aktivna' : 'Neaktivna'}
          </Chip>
        </View>

        <View style={styles.routeDetails}>
          <Text style={styles.routeTime}>
            🕐 {route.startTime} - {route.endTime}
          </Text>
          <Text style={styles.routeStops}>
            📍 {getStopsDisplay(route.stops)}
          </Text>
        </View>

        {route.driverName && (
          <Text style={styles.driverInfo}>
            👨‍✈️ Vozač: {route.driverName}
          </Text>
        )}
      </Surface>
    </TouchableOpacity>
  );
};

const BibliobusScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<BibliobusScreenNavigationProp>();
  const theme = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    busStops,
    routes,
    userDeliveries,
    selectedRoute,
    selectedStop,
    loading,
    error,
  } = useSelector((state: RootState) => state.bibliobus);

  const [refreshing, setRefreshing] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch, user?.id]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchBusStops()),
      dispatch(fetchBusRoutes()),
    ]);

    if (user?.id) {
      dispatch(fetchUserDeliveries(user.id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRoutePress = (route: any) => {
    if (selectedRoute?.id === route.id) {
      setSelectedRoute(null);
      setShowRouteDetails(false);
    } else {
      dispatch(setSelectedRoute(route));
      setShowRouteDetails(true);
    }
  };

  const handleStopSelect = (stop: any) => {
    dispatch(setSelectedStop(stop));
  };

  const navigateToReservationRequest = () => {
    if (selectedStop) {
      // Navigate to book catalog with selected stop
      navigation.navigate('Catalog');
    }
  };

  const handleCallDriver = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const activeDeliveries = userDeliveries.filter(
    delivery => delivery.status === 'SCHEDULED' || delivery.status === 'IN_TRANSIT'
  );

  const renderRouteDetails = () => {
    if (!selectedRoute || !showRouteDetails) return null;

    return (
      <Card style={styles.routeDetailsCard}>
        <Card.Content>
          <Text style={styles.routeDetailsTitle}>Detalji rute</Text>
          <View style={styles.stopsList}>
            {selectedRoute.stops.map((stop: any, index: number) => (
              <View key={stop.id} style={styles.stopItem}>
                <View style={styles.stopIndicator}>
                  <View style={[styles.stopDot, { backgroundColor: '#1976d2' }]} />
                  {index < selectedRoute.stops.length - 1 && (
                    <View style={styles.stopLine} />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.stopContent,
                    selectedStop?.id === stop.id && styles.selectedStopContent,
                  ]}
                  onPress={() => handleStopSelect(stop)}
                >
                  <Text style={[
                    styles.stopName,
                    selectedStop?.id === stop.id && styles.selectedStopName,
                  ]}>
                    {stop.name}
                  </Text>
                  <Text style={styles.stopAddress}>{stop.address}</Text>
                  {stop.description && (
                    <Text style={styles.stopDescription}>{stop.description}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {selectedStop && (
            <View style={styles.selectedStopActions}>
              <Text style={styles.selectedStopText}>
                Izabrana stanica: {selectedStop.name}
              </Text>
              <Button
                mode="contained"
                onPress={navigateToReservationRequest}
                style={styles.reserveButton}
              >
                Rezerviši knjigu za ovu stanicu
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderActiveDeliveries = () => {
    if (activeDeliveries.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivne dostave</Text>
        {activeDeliveries.map((delivery) => (
          <Card key={delivery.id} style={styles.deliveryCard}>
            <Card.Content>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryBookTitle}>
                    {delivery.reservation.book.title}
                  </Text>
                  <Text style={styles.deliveryAuthor}>
                    {delivery.reservation.book.author}
                  </Text>
                  <Text style={styles.deliveryLocation}>
                    📍 {delivery.busStop.name}
                  </Text>
                  <Text style={styles.deliveryTime}>
                    🕐 {delivery.scheduledDate} u {delivery.scheduledTime}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.deliveryStatusChip,
                    delivery.status === 'IN_TRANSIT' ? styles.inTransitChip : styles.scheduledChip,
                  ]}
                >
                  {delivery.status === 'IN_TRANSIT' ? 'U dostavi' : 'Zakazano'}
                </Chip>
              </View>

              {delivery.driverName && (
                <View style={styles.driverActions}>
                  <Text style={styles.driverInfo}>
                    👨‍✈️ Vozač: {delivery.driverName}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => handleCallDriver(delivery.driverName || '')}
                    compact
                    style={styles.callButton}
                  >
                    Pozovi
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderInfoSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>O Bibliobus servisu</Text>
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>
            🚌 Bibliobus - biblioteka na točkovima
          </Text>
          <Text style={styles.infoText}>
            Bibliobus donosi knjige u vašu bližinu! Usluga pokriva ruralna područja
            opštine Travnik i omogućava pristup književnom bogatstvu svim građanima.
          </Text>

          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>Red vožnje:</Text>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Ponedjeljak:</Text>
              <Text style={styles.scheduleRoute}>Ruta A (Dolac, Mehurići, Turbe)</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Srijeda:</Text>
              <Text style={styles.scheduleRoute}>Ruta B (Guća Gora, Novi Šeher, Lašva)</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Petak:</Text>
              <Text style={styles.scheduleRoute}>Ruta C (Ovčarevo, Kreševo put, Rostovo)</Text>
            </View>
          </View>

          <Text style={styles.contactInfo}>
            Imate pitanja? Pozovite nas: +387 30 123 456
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Učitavanje Bibliobus informacija...</Text>
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bibliobus</Text>
          <Text style={styles.subtitle}>
            Vaša mobilna biblioteka
          </Text>
        </View>

        {/* Active Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivne rute</Text>
          {routes.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  Trenutno nema aktivnih ruta
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.routesList}>
              {routes.map((route) => (
                <BusRouteCard
                  key={route.id}
                  route={route}
                  onPress={() => handleRoutePress(route)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Route Details */}
        {renderRouteDetails()}

        {/* Active Deliveries */}
        {renderActiveDeliveries()}

        {/* Information Section */}
        {renderInfoSection()}
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  routesList: {
    gap: 12,
  },
  routeCard: {
    marginBottom: 12,
  },
  routeSurface: {
    padding: 16,
    elevation: 2,
    borderRadius: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  routeDay: {
    fontSize: 14,
    color: '#666',
  },
  routeStatusChip: {
    alignSelf: 'flex-start',
  },
  activeChip: {
    backgroundColor: '#4caf50',
  },
  inactiveChip: {
    backgroundColor: '#f44336',
  },
  routeDetails: {
    gap: 8,
  },
  routeTime: {
    fontSize: 14,
    color: '#333',
  },
  routeStops: {
    fontSize: 14,
    color: '#666',
  },
  driverInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  routeDetailsCard: {
    marginTop: 12,
    backgroundColor: '#e3f2fd',
  },
  routeDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
  },
  stopsList: {
    paddingRight: 8,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stopIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stopLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1976d2',
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedStopContent: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedStopName: {
    color: '#1976d2',
  },
  stopAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  stopDescription: {
    fontSize: 12,
    color: '#999',
  },
  selectedStopActions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  selectedStopText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
    textAlign: 'center',
  },
  reserveButton: {
    marginTop: 8,
  },
  deliveryCard: {
    marginBottom: 12,
    backgroundColor: '#fff8e1',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deliveryAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deliveryLocation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  deliveryStatusChip: {
    alignSelf: 'flex-start',
  },
  scheduledChip: {
    backgroundColor: '#ff9800',
  },
  inTransitChip: {
    backgroundColor: '#4caf50',
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  callButton: {
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#f3e5f5',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  scheduleContainer: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 80,
  },
  scheduleRoute: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default BibliobusScreen;