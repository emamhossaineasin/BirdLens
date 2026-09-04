// src/types/navigation.ts

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {RootStackParamList} from '../navigation/types';

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export type SignupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Signup'
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type ProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Profile'
>;

export type CreatePostScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreatePost'
>;

export type EditProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

export type SearchScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Search'
>;

export type AboutUsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AboutUs'
>;