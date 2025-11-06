import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Checkbox,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '../../store';
import { register, clearError } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptedTerms: boolean;
}

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Greška', error, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  const updateFormData = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { name, email, password, confirmPassword, phone, acceptedTerms } = formData;

    if (!name.trim()) {
      Alert.alert('Greška', 'Molimo unesite vaše ime');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Greška', 'Molimo unesite email adresu');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Greška', 'Molimo unesite validnu email adresu');
      return false;
    }

    if (!password) {
      Alert.alert('Greška', 'Molimo unesite lozinku');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 karaktera');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne podudaraju');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Greška', 'Molimo unesite broj telefona');
      return false;
    }

    if (!acceptedTerms) {
      Alert.alert('Greška', 'Morate prihvatiti uslove korištenja');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, acceptedTerms, ...userData } = formData;
      await dispatch(register(userData)).unwrap();
    } catch (err: any) {
      // Error is handled in the useEffect above
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const showTermsAndConditions = () => {
    Alert.alert(
      'Uslovi korištenja',
      'Dobrodošli u Bibliobus Travnik!\n\n' +
      'Korištenjem ove aplikacije saglasni ste sa:\n' +
      '• Dostupom vaših podataka u svrhu identifikacije\n' +
      '• Praćenjem posuđenih knjiga i rezervacija\n' +
      '• Primama notifikacija o dostavama i datumima povrata\n' +
      '• Poštovanjem bibliotečkih pravila i rokova\n\n' +
      'Vaši podaci su zaštićeni i neće se deliti trećim licima.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Kreirajte nalog</Text>
            <Text style={styles.subtitle}>
              Postanite član digitalne biblioteke
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.form}>
                <TextInput
                  label="Ime i prezime"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  autoCapitalize="words"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                  disabled={loading}
                />

                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="email" />}
                  disabled={loading}
                />

                <TextInput
                  label="Telefon"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="phone" />}
                  disabled={loading}
                />

                <TextInput
                  label="Lozinka"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  disabled={loading}
                />

                <TextInput
                  label="Potvrdite lozinku"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  disabled={loading}
                />

                <View style={styles.termsContainer}>
                  <Checkbox
                    status={formData.acceptedTerms ? 'checked' : 'unchecked'}
                    onPress={() => updateFormData('acceptedTerms', !formData.acceptedTerms)}
                    disabled={loading}
                  />
                  <View style={styles.termsText}>
                    <Text>Prihvatam </Text>
                    <Text
                      style={styles.termsLink}
                      onPress={showTermsAndConditions}
                    >
                      uslove korištenja
                    </Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? 'Registracija...' : 'Registruj se'}
                </Button>

                <View style={styles.loginLink}>
                  <Text>Već imate nalog? </Text>
                  <Button
                    mode="text"
                    onPress={navigateToLogin}
                    compact
                    disabled={loading}
                  >
                    Prijavite se
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  termsText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
    flex: 1,
  },
  termsLink: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RegisterScreen;