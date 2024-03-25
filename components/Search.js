import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {auth} from "./../firebase"
import 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const Search = (props) => {

  const[isLoggedIn, setIsLoggedIn] = useState(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      setIsLoggedIn(true);
    } else {
      // User is signed out
      setIsLoggedIn(false);
    }
  });

  return (
    <View style={{ marginTop: 0, flex: 1, backgroundColor: "#eee" }}>
      <View
        style={{ padding: 15, marginTop: 30, flex: 1, flexDirection: "row", backgroundColor: "#ddd" }}
      >
        <View style={{ flex: 2 }}>
          <TouchableOpacity onPress={() => props.navigation.navigate("Home")}>
            <Text style={styles.appName}>BirdLens</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end", marginTop: 15 }}>
          {isLoggedIn?
          <TouchableOpacity onPress={() => props.navigation.navigate("Profile")}>
            <Text style={styles.loginLink}>Profile</Text>
          </TouchableOpacity>
          :<TouchableOpacity onPress={() => props.navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>}
          
        </View>
      </View>
      <View
        style={{
          flex: 16,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 35, fontWeight: "bold" }}>Welcome to BirdLens!</Text>
        <View style={{ margin: 10 }}>
          <Text style={styles.welcomeText}>
            Explore the bird world with ease! Whether you're new or experienced,
            our Bird Species Detection App is your guide. Discover birds around
            you, snap pictures for identification, and learn fascinating facts.
            Read species insights, and join a community
            of bird enthusiasts. Ready to embark on a birding adventure? Let's
            get started! Happy birding! 🌟
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center", flex: 4 }}>
        <View style={{ flex: 1, flexDirection: "row", }}>
          <View style={{ flex: 2, alignItems: "center" }}>
            <TouchableOpacity style={styles.buttonContainer}>
              <Image
                source={require("../assets/image-icon.png")}
                style={styles.imageButtonImage}
              />
              <Text style={{ fontSize: 15, fontWeight: "bold" }}>Upload</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 3 }}>
            <TouchableOpacity style={styles.buttonContainer}>
              <Image
                source={require("../assets/camera-icon.png")}
                style={styles.buttonImage}
              />
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#fff",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImage: {
    width: 80,
    height: 80,
  },
  imageButtonContainer: {
    position: "absolute",
    bottom: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 100,
  },
  imageButtonImage: {
    width: 60,
    height: 60,
  },
  welcomeText: {
    margin: 10,
    fontSize: 27,
    textAlign: "justify",
  },
  appName: {
    color: "black",
    fontSize: 40,
    fontWeight: "bold",
  },
  loginLink: {
    color: "#1877f2", // Facebook blue color
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default Search;
