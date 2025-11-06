export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;

  // Main
  Main: undefined;
  Home: undefined;
  Catalog: undefined;
  Search: undefined;
  Bibliobus: undefined;
  Profile: undefined;

  // Screens
  BookDetail: { bookId: string };
  Reservations: undefined;
  MembershipCard: undefined;
  Dashboard: undefined;

  // Additional screens that might be added
  ReservationDetail: { reservationId: string };
  DeliveryTracking: { deliveryId: string };
  EditProfile: undefined;
  Notifications: undefined;
  ReadingHistory: undefined;
  Achievements: undefined;
};