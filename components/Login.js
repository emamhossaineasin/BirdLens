import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from ".././firebase";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleLogin = async () => {
    try {
      // Attempt to log in with the provided email and password
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('');
      setPassword('');
      // Check if the user's email is verified
      const user = auth.currentUser;
      if (!user.emailVerified) {
        // Inform the user to verify their email
        Alert.alert('Email Not Verified', 'Please verify your email before logging in.');
        await auth.signOut(); // Sign out the user if email is not verified
      } else {
        // Navigate to the home screen
        props.navigation.navigate("Profile")
      }
    } catch (error) {
      // Handle login errors
      Alert.alert('Login Failed', "email or password is invalid");
    }
    
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>BirdLens</Text>

      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={!showPassword}
        value={password}
      />

      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={togglePasswordVisibility}
      >
        <Text>{showPassword ? "Hide" : "Show"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Signup")}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1877f2", // Facebook blue color
  },
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#1877f2", // Facebook blue color
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: "#1877f2", // Facebook blue color
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signupText: {
    color: "black",
    fontSize: 18,
  },
  signupLink: {
    color: "#1877f2", // Facebook blue color
    fontWeight: "bold",
    fontSize: 18,
  },
  showPasswordButton: {
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 168,
  },
});

export default Login;
