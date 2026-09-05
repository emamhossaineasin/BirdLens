import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signOut,
} from '@react-native-firebase/auth';
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { SignupScreenProps } from '../types/navigation';

type SignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: SignupForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Signup({
  navigation,
}: SignupScreenProps): React.JSX.Element {
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async (): Promise<void> => {
    const email = form.email.trim().toLowerCase();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !email ||
      !form.password ||
      !form.confirmPassword
    ) {
      Alert.alert('Missing information', 'Please complete every field.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Password mismatch', 'The passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);

      const auth = getAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        form.password,
      );

      const db = getFirestore();
      const profileReference = doc(db, 'users', credential.user.uid);

      await setDoc(profileReference, {
        user_id: credential.user.uid,
        f_name: form.firstName.trim(),
        l_name: form.lastName.trim(),
        email,
        phone: '',
        dob: null,
        image: '',
        country: null,
        sub_division: null,
        latitude: null,
        longitude: null,
        rating: 0,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(credential.user);
      await signOut(auth);

      Alert.alert(
        'Verification sent',
        'Check your email, verify your account, and then log in.',
        [{text: 'OK', onPress: () => navigation.navigate('Login')}],
      );

      setForm(initialForm);
    } catch (error: unknown) {
      console.error('Signup failed:', error);
      Alert.alert('Signup failed', 'The account could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>B</Text>
      </View>
      <Text style={styles.appName}>Join BirdLens</Text>
      <Text style={styles.subtitle}>Build your field guide, one bird at a time.</Text>
      <Text style={styles.title}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={form.firstName}
        onChangeText={firstName =>
          setForm(current => ({...current, firstName}))
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={form.lastName}
        onChangeText={lastName =>
          setForm(current => ({...current, lastName}))
        }
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!showPassword}
        value={form.confirmPassword}
        onChangeText={confirmPassword =>
          setForm(current => ({...current, confirmPassword}))
        }
      />

      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={() => setShowPassword(current => !current)}>
        <Text>{showPassword ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        disabled={submitting}
        onPress={handleSignUp}>
        <Text style={styles.buttonText}>
          {submitting ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Log In</Text>
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
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#ed8b5b',
    borderRadius: 19,
    height: 56,
    justifyContent: 'center',
    marginBottom: 10,
    width: 56,
  },
  brandMarkText: {
    color: '#12372a',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#bdd4c4',
    fontSize: 14,
    marginBottom: 25,
  },
  title: {
    alignSelf: 'flex-start',
    color: '#fffdf8',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fffdf8',
    borderRadius: 12,
    color: '#19352b',
    height: 48,
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
  signupButton: {
    alignItems: 'center',
    backgroundColor: '#ed8b5b',
    borderRadius: 12,
    marginTop: 6,
    padding: 15,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: '#bdd4c4',
    fontSize: 15,
  },
  loginLink: {
    color: '#f4ad80',
    fontSize: 15,
    fontWeight: 'bold',
  },
});