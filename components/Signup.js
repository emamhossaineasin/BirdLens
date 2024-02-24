import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, TouchableWithoutFeedback } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, firebase } from ".././firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const Signup = (props) => {

  const [firstName, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userExist, setUserExist] = useState(false);
  const [bDate, setBDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  //const [manualDate, setManualDate] = useState('');

  useEffect(() => {
    const checkEmailAvailability = async () => {
      try {
        if (email.trim() !== '') {
          const querySnapshot = await firebase.firestore().collection('users').where('email', '==', email).get();
          setUserExist(!querySnapshot.empty);
          console.log(userExist);
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkEmailAvailability();
  }, [email])

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSignUp = async () => {
    if(password==confirmPassword && !userExist ){
      try {
          createUserWithEmailAndPassword(auth, email, password)
          .then(() => {
            const uId = firebase.auth().currentUser.uid;
            firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
              user_id : uId,
              f_name: firstName,
              l_name: lastname,
              mobile: mobile,
              b_date: bDate,
              email: email,
            })
            
          })
          .then(() => props.navigation.navigate("Login"));
        
        
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
    else{
      Alert.alert("Password didn't match or email is already in use");
    }
  };

  const handleConfirm = (date) => {
    setBDate(date);
    hideDatePicker();
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
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
        placeholder="Mobile"
        onChangeText={(text) => setMobile(text)}
        //keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableWithoutFeedback onPress={showDatePicker}>
        <View style={{width: '100%',}}>
          <TextInput
            style={styles.input}
            placeholder="Select Date of Birth"
            value={bDate ? bDate.toDateString() : ''}
            editable={false}
          />
        </View>
      
      </TouchableWithoutFeedback>

      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email address"
        onChangeText={(text) => setEmail(text)}
        //keyboardType="email-address"
        autoCapitalize="none"
      />

      {userExist && <Text style={styles.verification}> *This email is already in use* </Text>}
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
  verification: {
    color: "red",
    fontSize: 15,
  }
});

export default Signup;