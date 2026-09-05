import 'react-native-gesture-handler';

import '@react-native-firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from '@react-native-firebase/auth';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {
  createBottomTabNavigator,
  type BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import {
  NavigationContainer
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type {
  BottomTabParamList,
  RootStackParamList,
} from './navigation/types';
// Screens are required dynamically below to avoid importing modules
// that access Firebase before the native Firebase app is initialized.

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

type ScreenComponent = React.ComponentType<Record<string, unknown>>;

function getTabScreenOptions({
  route,
}: BottomTabScreenProps<BottomTabParamList>): object {
  return {
    headerShown: false,
    tabBarActiveTintColor: '#1f6b4f',
    tabBarInactiveTintColor: '#8b968f',
    tabBarLabelStyle: styles.tabLabel,
    tabBarStyle: styles.tabBar,
    tabBarIcon: ({ color, size, focused }: {
      color: string;
      size: number;
      focused: boolean;
    }) => {
      const icons = {
        Home: focused ? 'home' : 'home-outline',
        Search: focused ? 'search' : 'search-outline',
        Profile: focused ? 'person' : 'person-outline',
        AboutUs: focused ? 'information-circle' : 'information-circle-outline',
      } as const;

      return (
        <Ionicons
          name={icons[route.name]}
          color={color}
          size={size}
        />
      );
    },
  };
}

function MainTabs({
  Home,
  Search,
  Profile,
  AboutUs,
}: {
  Home: ScreenComponent;
  Search: ScreenComponent;
  Profile: ScreenComponent;
  AboutUs: ScreenComponent;
}): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={getTabScreenOptions}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="AboutUs" component={AboutUs} />
    </Tab.Navigator>
  );
}

export default function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  getAuth();

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

  const Home = require('./screens/Home').default;
  const Profile = require('./screens/Profile').default;
  const CreatePost = require('./screens/CreatePost').default;
  const EditProfile = require('./screens/EditProfile').default;
  const Search = require('./screens/Search').default;
  const AboutUs = require('./screens/AboutUs').default;
  const Login = require('./screens/Login').default;
  const Signup = require('./screens/Signup').default;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{headerShown: false}}
        >
          {user ? (
            <>
              <Stack.Screen
                name="MainTabs"
                children={() => (
                  <MainTabs
                    Home={Home as unknown as ScreenComponent}
                    Search={Search as unknown as ScreenComponent}
                    Profile={Profile as unknown as ScreenComponent}
                    AboutUs={AboutUs as unknown as ScreenComponent}
                  />
                )}
              />
              <Stack.Screen name="CreatePost" component={CreatePost} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
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
  tabBar: {
    backgroundColor: '#fffdf8',
    borderTopColor: '#e7eee8',
    borderTopWidth: 1,
    elevation: 10,
    height: 68,
    paddingBottom: 8,
    paddingTop: 7,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});