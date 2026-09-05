import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { LoginScreenProps } from '../types/navigation';

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
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>B</Text>
      </View>
      <Text style={styles.appName}>BirdLens</Text>
      <Text style={styles.subtitle}>See the world through a sharper lens.</Text>
      <Text style={styles.title}>Welcome back</Text>

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
    backgroundColor: '#9BADED',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    color: '#fffdf8',
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#ed8b5b',
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    marginBottom: 12,
    width: 64,
  },
  brandMarkText: {
    color: '#12372a',
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: '#bdd4c4',
    fontSize: 14,
    marginBottom: 42,
  },
  title: {
    alignSelf: 'flex-start',
    color: '#fffdf8',
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#fffdf8',
    borderRadius: 12,
    color: '#19352b',
    height: 52,
    marginBottom: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  showPasswordButton: {
    alignItems: 'center',
    backgroundColor: '#dce9df',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    width: '100%',
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#ed8b5b',
    borderRadius: 12,
    marginTop: 8,
    padding: 15,
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
    color: '#bdd4c4',
    fontSize: 15,
  },
  signupLink: {
    color: '#f4ad80',
    fontSize: 15,
    fontWeight: 'bold',
  },
});