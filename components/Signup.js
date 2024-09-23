import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, firebase } from ".././firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const Signup = (props) => {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userExist, setUserExist] = useState(false);

  useEffect(() => {
    const checkEmailAvailability = async () => {
      try {
        if (data.email.trim() !== "") {
          const querySnapshot = await firebase
            .firestore()
            .collection("users")
            .where("email", "==", data.email)
            .get();
          setUserExist(!querySnapshot.empty);
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkEmailAvailability();
  }, [data.email]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSignUp = async () => {
    if (
      data.firstName === "" ||
      data.lastName === "" ||
      data.email === "" ||
      data.password === "" ||
      data.confirmPassword === "" ||
      data.password != data.confirmPassword ||
      userExist
    ) {
      if (password != confirmPassword) {
        Alert.alert("Password didn't matched");
      }
      if (userExist) {
        Alert.alert("User with this email already esixt");
      }
      Alert.alert("Fill all input");
      setTimeout(() => {
        setSelectType(false);
      }, 5000);
      return;
    }
    try {
      
      await firebase
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password)
        .then(() => {
          firebase
            .auth()
            .currentUser.sendEmailVerification({
              handleCodeInApp: true,
              url: "https://birdlens-7c3ad.firebaseapp.com",
            })
            .then(() => {
              
              alert("Verification email sent");
              
              props.navigation.navigate("Login");
            })
            .catch((err) => {
              console.log(err);
            })
            .then(() => {
              const uId = firebase.auth().currentUser.uid;
              firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
                  user_id: uId,
                  f_name: data.firstName,
                  l_name: data.lastName,
                  email: data.email,
                  phone: "",
                  dob: "",
                  image: "",
                  division: "",
                  district: "",
                  upazila: "",
                  latitude: "",
                  longitude: "",
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>BirdLens</Text>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={(text) => setData({ ...data, firstName: text })}
        //keyboardType="name"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={(text) => setData({ ...data, lastName: text })}
        //keyboardType="name"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email address"
        onChangeText={(text) => setData({ ...data, email: text })}
        //keyboardType="email-address"
        autoCapitalize="none"
      />

      {userExist && (
        <Text style={styles.verification}>
          {" "}
          *This email is already in use*{" "}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setData({ ...data, password: text })}
        secureTextEntry={!showPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        onChangeText={(text) => setData({ ...data, confirmPassword: text })}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={togglePasswordVisibility}
      >
        <Text>{showPassword ? "Hide" : "Show"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Log In</Text>
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
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#1877f2", // Facebook blue color
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
  signupButton: {
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
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    color: "black",
    fontSize: 18,
  },
  loginLink: {
    color: "#1877f2", // Facebook blue color
    fontWeight: "bold",
    fontSize: 18,
  },
  showPasswordButton: {
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  verification: {
    color: "red",
    fontSize: 15,
  },
});

export default Signup;
