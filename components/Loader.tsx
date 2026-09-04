import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type ColorValue,
} from 'react-native';

type LoaderProps = {
  color?: ColorValue;
  text?: string;
};

export default function Loader({
  color = '#f0ad4e',
  text = 'Loading...',
}: LoaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  text: {
    color: 'gray',
    fontSize: 20,
    marginTop: 10,
  },
});