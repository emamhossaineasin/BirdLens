import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from ".././firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore"; 


const Signup = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };


  function create(){
    addDoc(collection(db, "users"), {
      f_name: firstName,
      l_name: lastname,
      email: email,
    });

  }

  const handleSignUp = async () => {
    if(password===confirmPassword){
      try {
        createUserWithEmailAndPassword(auth, email, password)
        .then(() => create())
        .then(() => props.navigation.navigate("Login"));
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
    else{
      Alert.alert("Password didn't match");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={(text) => setFirstName(text)}
        //keyboardType="name"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={(text) => setLastName(text)}
        //keyboardType="name"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email address"
        onChangeText={(text) => setEmail(text)}
        //keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={!showPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity style={styles.showPasswordButton} onPress={togglePasswordVisibility}>
        <Text>{showPassword ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity  onPress={() => props.navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Don't want to Sign Up? </Text>
        <TouchableOpacity onPress={()=> props.navigation.navigate("Home")} >
          <Text style={styles.loginLink}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1877f2', // Facebook blue color
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  signupButton: {
    backgroundColor: '#1877f2', // Facebook blue color
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: 'black',
    fontSize: 18,
  },
  loginLink: {
    color: '#1877f2', // Facebook blue color
    fontWeight: 'bold',
    fontSize: 18,
  },
  showPasswordButton: {
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 168
  },
});

export default Signup;