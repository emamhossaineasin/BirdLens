import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from "react-native";
import { signOut } from "firebase/auth";
import { FontAwesome6 } from "@expo/vector-icons";
import { auth, db, firebase } from ".././firebase";
import * as ImagePicker from "expo-image-picker";
import UploadModal from "./UploadModal";
import Loader from "./Loader";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

//const auth = getAuth();

// Profile component
const Profile = (props) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);

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
      <View style={{ flex: 20, width: "100%", backgroundColor: "#fff" }}>
        <View style={styles.heading}>
          <View
            style={{
              flex: 1,
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexDirection: "row",
            }}
          >
            <FontAwesome6 name="circle-user" size={30} color="black" />
            <Text style={{ fontSize: 25 }}> Profile</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("EditProfile");
              }}
              style={{ flexDirection: "row" }}
            >
              <Feather name="edit" size={25} color="black" />
              <Text
                style={{
                  fontSize: 20,
                  marginVertical: 2,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                {" "}
                EDIT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <View style={styles.content}>
              <View style={styles.profilePic}>
                <Image
                  style={styles.image}
                  source={
                    userData.image === ""
                      ? require("./../assets/profile_image.png")
                      : { uri: userData.image }
                  }
                />
              </View>
              <Text style={styles.name}>
                {userData.f_name + " " + userData.l_name}
              </Text>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.details}>Details</Text>

                <Text style={styles.info}>Email: {userData.email}</Text>

                <Text style={styles.info}>
                  Phone: {userData.phone || "Not Provided Yet"}
                </Text>

                <Text style={styles.info}>
                  Date of Birth:{" "}
                  {userData.dob
                    ? userData.dob.toDate().toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not Provided Yet"}
                </Text>

                <Text style={styles.info}>
                  Address:{" "}
                  {userData.district
                    ? userData.upazila +
                      ", " +
                      userData.district +
                      ", " +
                      userData.division
                    : "Not Provided Yet"}
                </Text>
              </View>
              {!showMap && userData.latitude && (
                <TouchableOpacity
                  onPress={() => setShowMap(true)}
                  style={{ flexDirection: "row" }}
                >
                  <Feather name="map-pin" size={24} color="black" />
                  <Text
                    style={{ color: "black", fontSize: 20, fontWeight: "bold" }}
                  >
                    Show Map Location
                  </Text>
                </TouchableOpacity>
              )}
              {showMap && (
                <TouchableOpacity
                  onPress={() => setShowMap(false)}
                  style={{ flexDirection: "row" }}
                >
                  <Feather name="map-pin" size={24} color="black" />
                  <Text
                    style={{ color: "black", fontSize: 20, fontWeight: "bold" }}
                  >
                    Hide Map Location
                  </Text>
                </TouchableOpacity>
              )}
              {showMap && (
                <MapView
                  style={styles.map}
                  region={{
                    latitude: userData.latitude,
                    longitude: userData.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: userData.latitude,
                      longitude: userData.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                    title="Marker"
                  ></Marker>
                </MapView>
              )}
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("CreatePost");
                }}
                style={styles.postButton}
              >
                <Text style={styles.buttonText}>Create a Post</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    marginTop: 10,
    marginBottom: 10,
    width: "95%",
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
  name: {
    alignSelf: "center",
    marginTop: 10,
    fontSize: 28,
    fontWeight: "bold",
  },
  info: {
    fontSize: 20,
    marginVertical: 5,
    fontWeight: "bold",
  },
  details: {
    fontSize: 30,
    marginVertical: 5,
    fontWeight: "bold",
  },
  input: {
    // width: '95%',
    borderWidth: 1,
    borderColor: "dimgray",
    fontSize: 20,
    color: "black",
    borderRadius: 10,
    padding: 5,
    color: "black",
  },
  heading: {
    marginTop: 20,
    width: "95%",
    alignSelf: "center",
    display: "flex",
    flexDirection: "row",
  },
  postButton: {
    backgroundColor: "#1877f2", // Facebook blue color
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  postContainer: {
    backgroundColor: "#ffffff",
    marginTop: 2,
    overflow: "hidden",
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  author: {
    fontWeight: "bold",
    fontSize: 18,
  },
  message: {
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  postImage: {
    width: "100%",
    height: 370,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 15,
  },
});

export default Profile;
