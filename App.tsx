import 'react-native-gesture-handler';

import '@react-native-firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    type User,
} from '@react-native-firebase/auth';
import {
    NavigationContainer
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './navigation/types';
// Screens are required dynamically below to avoid importing modules
// that access Firebase before the native Firebase app is initialized.

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Ensure the native Firebase app is initialized synchronously so
  // modules that `require` Firebase (e.g. services/firebase) do not
  // attempt to access an uninitialized default app during import.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ensureAuthInit = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    const fallback = setTimeout(() => {
      setInitializing(false);
    }, 10000);

    return () => {
      clearTimeout(fallback);
      unsubscribe();
    };
  }, []);

  if (initializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={styles.loadingText}>Loading BirdLens...</Text>
      </View>
    );
  }

  // Require screens lazily now that Firebase native modules are ready.
  // This prevents screen modules from importing `services/firebase`
  // before the native Firebase app has been initialized.
  // eslint-disable-next-line global-require
  const Home = require('./screens/Home').default;
  // eslint-disable-next-line global-require
  const Profile = require('./screens/Profile').default;
  // eslint-disable-next-line global-require
  const CreatePost = require('./screens/CreatePost').default;
  // eslint-disable-next-line global-require
  const EditProfile = require('./screens/EditProfile').default;
  // eslint-disable-next-line global-require
  const Search = require('./screens/Search').default;
  // eslint-disable-next-line global-require
  const AboutUs = require('./screens/AboutUs').default;
  // eslint-disable-next-line global-require
  const Login = require('./screens/Login').default;
  // eslint-disable-next-line global-require
  const Signup = require('./screens/Signup').default;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{headerShown: false}}
        >
          {user ? (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="CreatePost" component={CreatePost} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="Search" component={Search} />
              {/* @ts-ignore */}
              <Stack.Screen name="AboutUs" component={AboutUs} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    backgroundColor: '#f5f7fb',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#1f2937',
    fontSize: 16,
    marginTop: 12,
  },
});