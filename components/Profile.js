// Import necessary React Native components
import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, TextInput, Image, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { signOut } from "firebase/auth";
import { FontAwesome6 } from '@expo/vector-icons';
import { auth, db, firebase } from ".././firebase";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import UploadModal from "./UploadModal";
import Loader from "./Loader";

//const auth = getAuth();

// Sample user data
const userData = {
  name: "John Doe",
  profilePicture: "https://example.com/profile.jpg",
  bio: "Hello, I am a React Native developer!",
  // Add more user-related information as needed
};

// Profile component
const Profile = (props) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        const userDocRef = firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid);

        // Use onSnapshot to listen for real-time updates
        const unsubscribe = userDocRef.onSnapshot((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
            setLoading(false);
          } else {
            // Handle the case where the document doesn't exist
            setUserData(null);
            setLoading(false);
          }
        });

        // Clean up the listener when the component unmounts or changes
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = () => {
    setModalVisible(!modalVisible);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    // console.log(result)
    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    try {
      const data = new FormData();
      data.append("file", {
        uri,
        type: "image/jpeg", // adjust the type based on the file type
        name: "upload.jpg",
      });

      const preset_key = "BirdLens";
      const cloud_name = "dw5vnzqyw";
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        data,
        {
          withCredentials: false,

          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            upload_preset: preset_key,
          },
        }
      );

      const result = response.data;
      console.log(result.url);
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({ image: result.url })
        .then(() => {
          setModalVisible(false);
        })
        .catch((err) => {
          console.log("firebase err : " + err.code);
        });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error.message);
    }
  };

  // Example logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User successfully logged out
      props.navigation.navigate("Login");
    } catch (error) {
      // Handle logout error
      console.error("Error during logout:", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          padding: 15,
          marginTop: 30,
          flex: 1,
          flexDirection: "row",
          backgroundColor: "#ddd",
        }}
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
      <View style={{ flex: 20, width: '100%' }}>
        <View style={styles.mainContainer}>
          <View>
            {modalVisible ? (
              <UploadModal
                isModalVisible={modalVisible}
                setModalVisible={setModalVisible}
                pickImage={pickImage}
                takePicture={takePicture}
              />
            ) : null}
          </View>
          
          {loading === true ? (
            <Loader color="black" />
          ) : userData ? (
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.profilePic}>
                <Image
                  style={styles.image}
                  source={
                    userData.image === ""
                      ? require("./../assets/profile_image.png")
                      : { uri: userData.image }
                  }
                />
                <TouchableOpacity style={styles.uploadBtn} onPress={openModal}>
                  <Text style={{fontSize:20}}>Change Image</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subHeading}>
                Details Information
              </Text>
              <View style={styles.details}>
                <View style={styles.inputField}>
                  <Text style={{ fontSize: 20, marginVertical: 5 }}>
                    Full Name:
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={"dimgray"}
                    value={userData.f_name || "Not Provided Yet"}
                    editable={false}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={{ fontSize: 20, marginVertical: 5 }}>
                    Email:
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={"dimgray"}
                    value={userData.email || "Not Provided Yet"}
                    editable={false}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={{ fontSize: 20, marginVertical: 5 }}>
                    Phone:{" "}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={"dimgray"}
                    value={userData.mobile || "Not Provided Yet"}
                    editable={false}
                  />
                </View>
                <View style={styles.inputField}>
                  <Text style={{ fontSize: 20, marginVertical: 5 }}>
                    Date of Birth:{" "}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor={"dimgray"}
                    value={
                      userData.b_date
                        ? userData.b_date.toDate().toLocaleDateString()
                        : "Not Provided Yet"
                    }
                    editable={false}
                  />
                </View>
              </View>
            </ScrollView>
          ) : (
            <Text style={{ justifyContent: "center", alignItems: "center" }}>
              No user data available
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  mainContainer: {
    flex: 1,
    flexDirection: "column",
  },
  heading: {
    marginTop: 10,
    height: 40,
    width: "100%",
    alignSelf: "center",
    display: "flex",
    flexDirection: "row",
  },
  content: {
    marginTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
  },

  profilePic: {
    display: "flex",
    flexDirection: "column",
  },
  uploadBtn: {
    width: "40%",
    backgroundColor: "cadetblue",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    margin: 5,
    alignSelf: "center",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    marginTop: 10,
    
  },
  subHeading: {
    alignSelf: "center",
    marginTop: 10,
    fontSize: 30,
    fontWeight: "bold"
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    // width : '100%'
  },
  input: {
    // width: '95%',
    borderWidth: 2,
    borderColor: "dimgray",
    fontSize: 20,
    color: "black",
    borderRadius: 10,
    padding: 5,
    color: "dimgray",
  },
});

export default Profile;
