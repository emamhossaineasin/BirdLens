import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, firebase } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import CreatePost from "./components/CreatePost";
import EditProfile from "./components/EditProfile";
import Search from "./components/Search";
import AboutUs from "./components/AboutUs";
import Loader from "./components/Loader";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          await signInWithEmailAndPassword(auth, userData.email, userData.password)
          .then(() => {
            console.log("Login successful");
            setUser(userData.email);
          })
          .catch((err) => {
            console.log("Error while sign in", err.message);
          });
           // Set the user email to state
        }
      } catch (err) {
        console.log("Error retrieving user data:", err.message);
      } finally {
        setLoading(false);  // Stop loading after user fetching completes
      }
    };

    getUser();
  }, []);

  if (loading) {
    return <View style={{flex: 1, justifyContent: "center", alignItems: "center",}} >
      <Loader color="black" />
      </View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="CreatePost" component={CreatePost} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="CreatePost" component={CreatePost} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="AboutUs" component={AboutUs} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
