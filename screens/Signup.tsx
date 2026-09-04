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

import type {SignupScreenProps} from '../types/navigation';

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
      <Text style={styles.appName}>BirdLens</Text>
      <Text style={styles.title}>Create an Account</Text>

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
    backgroundColor: '#eee',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    color: '#1877f2',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
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
    padding: 12,
    width: '100%',
  },
  signupButton: {
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: 'black',
    fontSize: 18,
  },
  loginLink: {
    color: '#1877f2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});