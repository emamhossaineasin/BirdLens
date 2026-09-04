import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

import type {LoginScreenProps} from '../types/navigation';

type LoginForm = {
  email: string;
  password: string;
};

export default function Login({
  navigation,
}: LoginScreenProps): React.JSX.Element {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const handleLogin = async (): Promise<void> => {
    const email = form.email.trim();

    if (!email || !form.password) {
      Alert.alert('Missing information', 'Enter your email and password.');
      return;
    }

    try {
      setSubmitting(true);

      const auth = getAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        form.password,
      );

      if (!credential.user.emailVerified) {
        Alert.alert(
          'Email not verified',
          'Please verify your email before logging in.',
        );

        await signOut(auth);
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      Alert.alert('Login failed', 'The email or password is invalid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>BirdLens</Text>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={form.email}
        onChangeText={email => setForm(current => ({...current, email}))}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={form.password}
        onChangeText={password =>
          setForm(current => ({...current, password}))
        }
      />

      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={() => setShowPassword(current => !current)}>
        <Text>{showPassword ? 'Hide password' : 'Show password'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        disabled={submitting}
        onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {submitting ? 'Logging in...' : 'Log In'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#eee',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    color: '#1877f2',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  title: {
    color: '#1877f2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderColor: 'gray',
    borderRadius: 5,
    borderWidth: 1,
    height: 44,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  showPasswordButton: {
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#1877f2',
    borderRadius: 5,
    padding: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signupText: {
    color: 'black',
    fontSize: 18,
  },
  signupLink: {
    color: '#1877f2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});