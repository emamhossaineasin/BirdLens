
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  BottomTabParamList,
  RootStackParamList,
} from '../navigation/types';

export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

export type SignupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Signup'
>;

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;

export type CreatePostScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreatePost'
>;

export type EditProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

export type SearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;

export type AboutUsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'AboutUs'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;