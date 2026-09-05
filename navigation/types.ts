import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  CreatePost: undefined;
  EditProfile: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  AboutUs: undefined;
};