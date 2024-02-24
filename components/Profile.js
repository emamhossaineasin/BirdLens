// Import necessary React Native components
import React, {useState} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db, firebase } from ".././firebase";

//const auth = getAuth();

// Sample user data
const userData = {
  name: 'John Doe',
  profilePicture: 'https://example.com/profile.jpg',
  bio: 'Hello, I am a React Native developer!',
  // Add more user-related information as needed
};

// Profile component
const Profile = (props) => {

  const [userName, setUserName] = useState('');    

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
      <View style={{flex: 20}}>
      <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('./../assets/profile_image.png')}
          style={styles.profileImage}
        />
        <Text style={styles.username}>@YourUsername</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>100</Text>
          <Text style={styles.statLabel}>Tweets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>200</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
      <Text style={styles.bio}>
        Your bio text goes here. Keep it short and interesting!
      </Text>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginRight: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  bio: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default Profile;
