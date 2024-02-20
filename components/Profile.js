// Import necessary React Native components
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

const auth = getAuth();

// Sample user data
const userData = {
  name: 'John Doe',
  profilePicture: 'https://example.com/profile.jpg',
  bio: 'Hello, I am a React Native developer!',
  // Add more user-related information as needed
};

// Profile component
const Profile = (props) => {
  

// Example logout function
const handleLogout = async () => {
  try {
    await signOut(auth);
    // User successfully logged out
    props.navigation.navigate("Login")
  } catch (error) {
    // Handle logout error
    console.error('Error during logout:', error.message);
  }
};
  return (
    <View style={styles.container}>
      <View
        style={{ padding: 15, marginTop: 30, flex: 1, flexDirection: "row", backgroundColor: "#ddd" }}
      >
        <View style={{ flex: 2 }}>
          <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
            <Text style={styles.appName}>BirdLens</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", marginTop: 15 }}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutLink}>Logout</Text>
          </TouchableOpacity>
          
        </View>
      </View>
      <View style={{flex: 16}}>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.bio}>{userData.bio}</Text>
        {/* Add more profile details here */}
        
        <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
          <Text style={styles.settingsLink}>Go to Home</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    marginBottom: 20,
  },
  settingsLink: {
    color: 'blue',
    fontSize: 16,
  },
  appName: {
    color: "black",
    fontSize: 40,
    fontWeight: "bold",
  },
  logoutLink: {
    color: "#1877f2", // Facebook blue color
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default Profile;
