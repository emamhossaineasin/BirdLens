import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { auth, db, firebase } from ".././firebase";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import UploadModal from "./UploadModal";
import Loader from "./Loader";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome6 } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { getFormatedDate } from "react-native-modern-datepicker";
import DateModal from "./DateModal";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const EditProfile = (props) => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate()),
    "YYYY/MM/DD"
  );
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [startedDate, setStartedDate] = useState(startDate);

  function handleChangeStartDate(propDate) {
    setStartedDate(propDate);
  }

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedUpazila, setSelectedUpazila] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLocation, setInitialLocation] = useState({
    latitude: 23.8103,
    longitude: 90.4125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Validate phone number when userData changes
    if (userData && userData.phone) {
      const slicedString = userData.phone.slice(0, 3);
      if (
        userData.phone.length == 11 &&
        (slicedString == "013" ||
          slicedString == "014" ||
          slicedString == "015" ||
          slicedString == "016" ||
          slicedString == "017" ||
          slicedString == "018" ||
          slicedString == "019")
      ) {
        setPhoneError("");
      } else {
        setPhoneError("Mobile Number is invalid");
      }
    } else {
      setPhoneError("");
    }
  }, [userData]);

  useEffect(() => {
    // Fetch divisions
    const fetchDivisions = async () => {
      try {
        const response = require("./../assets/divisions.json");
        setDivisions(response[2].data);
      } catch (error) {
        console.error("Error reading divisions.json:", error);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        if (selectedDivision) {
          // Add a check here
          const response = require("./../assets/districts.json");
          const selected_division = divisions.filter(
            (division) => division.name === selectedDivision
          );
          // console.log(selected_division)
          const requiredDistricts = response[2].data.filter(
            (district) => district.division_id === selected_division[0].id
          );
          setDistricts(requiredDistricts);
        }
      } catch (err) {
        console.error("Error reading districts.json:", err);
      }
    };
    fetchDistricts();
  }, [selectedDivision]);

  useEffect(() => {
    const fetchUpazilas = async () => {
      try {
        if (selectedDistrict) {
          // Add a check here
          const response = require("./../assets/upazilas.json");
          const selected_district = districts.filter(
            (district) => district.name === selectedDistrict
          );
          const requiredUpazilas = response[2].data.filter(
            (upazila) => upazila.district_id === selected_district[0].id
          );
          setUpazilas(requiredUpazilas);
        }
      } catch (err) {
        console.error("Error reading upazilas.json:", err);
      }
    };
    fetchUpazilas();
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchData = () => {
      try {
        return firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .onSnapshot(
            (doc) => {
              if (doc.exists) {
                const userData = doc.data();
                setUserData(userData);
                setSelectedDivision(userData.division);
                setSelectedDistrict(userData.district);
                setSelectedUpazila(userData.upazila);
                userData.latitude
                  ? setInitialLocation({
                      ...initialLocation,
                      latitude: userData.latitude,
                      longitude: userData.longitude,
                    })
                  : null;

                if (userData.dob) {
                  const date = new Date(userData.dob.toDate());
                  setSelectedStartDate(getFormatedDate(date, "YYYY/MM/DD"));
                }
              }
            },
            (error) => {
              console.error("Error fetching user data:", error);
            }
          );
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchData();
  }, []);

  const userLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    setInitialLocation({
      ...initialLocation,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    // console.log(location.coords.latitude, location.coords.longitude);
  };

  const handleSubmit = async () => {
    try {
      const parts = selectedStartDate.split("/");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are zero-based
      const day = parseInt(parts[2], 10);

      const dateObject = new Date(year, month, day);

      const timestamp = firebase.firestore.Timestamp.fromDate(dateObject);

      await firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          f_name: userData.f_name,
          l_name: userData.l_name,
          phone: userData.phone,
          dob: timestamp,
          division: selectedDivision,
          district: selectedDistrict,
          upazila: selectedUpazila,
          address:
            selectedDivision + ", " + selectedDistrict + ", " + selectedUpazila,
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        })
        .then(() => {
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
          }, 6000);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const openModal = () => {
    setModalVisible(!modalVisible);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    // console.log(result)
    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
      setModalVisible(false);
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
      setModalVisible(false);
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

  return (
    <View style={styles.container}>
      {openStartDatePicker ? (
        <DateModal
          openStartDatePicker={openStartDatePicker}
          startDate={startDate}
          startedDate={startedDate}
          handleChangeStartDate={handleChangeStartDate}
          setSelectedStartDate={setSelectedStartDate}
          handleOnPressStartDate={handleOnPressStartDate}
        />
      ) : null}
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
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("Profile");
            }}
          >
            <Text style={styles.logoutLink}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 20, width: "100%", backgroundColor: "#eee" }}>
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
                  <Text style={{ fontSize: 20 }}>Change Image</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subHeading}>Edit Information</Text>

              {userData ? (
                
                  <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.details}>
                      <View style={styles.inputField}>
                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          First Name:
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholderTextColor={"dimgray"}
                          cursorColor={"black"}
                          value={userData.f_name}
                          onChangeText={(text) =>
                            setUserData({ ...userData, f_name: text })
                          }
                        />
                      </View>
                      <View style={styles.inputField}>
                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Last Name:
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholderTextColor={"dimgray"}
                          cursorColor={"black"}
                          value={userData.l_name}
                          onChangeText={(text) =>
                            setUserData({ ...userData, l_name: text })
                          }
                        />
                      </View>

                      <View style={styles.inputField}>
                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Phone:
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholderTextColor={"dimgray"}
                          placeholder="Enter your phone number"
                          cursorColor={"black"}
                          keyboardType="phone-pad"
                          value={userData.phone}
                          onChangeText={(text) =>
                            setUserData({ ...userData, phone: text })
                          }
                        />
                        {phoneError ? (
                          <Text style={{ color: "red" }}>{phoneError}</Text>
                        ) : null}
                      </View>
                      <View style={styles.inputField}>
                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Date of Birth:{" "}
                        </Text>
                        <TouchableOpacity onPress={handleOnPressStartDate}>
                          <TextInput
                            style={styles.input}
                            placeholderTextColor={"dimgray"}
                            value={selectedStartDate || "Click to select date"}
                            editable={false}
                          />
                        </TouchableOpacity>
                      </View>
                      <View>
                        {/* Division Dropdown */}
                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Select Division:
                        </Text>
                        <Picker
                          selectedValue={selectedDivision}
                          onValueChange={(itemValue) =>
                            setSelectedDivision(itemValue)
                          }
                          style={styles.pickerStyle}
                        >
                          {[{ name: "Select Division" }, ...divisions].map(
                            (division, index) => (
                              <Picker.Item
                                key={index}
                                label={division.name}
                                value={division.name}
                                enabled={index !== 0}
                              />
                            )
                          )}
                        </Picker>

                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Select District:
                        </Text>
                        <Picker
                          selectedValue={selectedDistrict}
                          onValueChange={(itemValue) =>
                            setSelectedDistrict(itemValue)
                          }
                          style={styles.pickerStyle}
                        >
                          {[{ name: "Select District" }, ...districts].map(
                            (district, index) => (
                              <Picker.Item
                                key={index}
                                label={district.name}
                                value={district.name}
                                enabled={index !== 0}
                              />
                            )
                          )}
                        </Picker>

                        <Text
                          style={{
                            fontSize: 20,
                            marginVertical: 5,
                            fontWeight: "bold",
                          }}
                        >
                          Select Upazila:
                        </Text>
                        <Picker
                          selectedValue={selectedUpazila}
                          onValueChange={(itemValue) =>
                            setSelectedUpazila(itemValue)
                          }
                          style={styles.pickerStyle}
                        >
                          {[{ name: "Select Upazila" }, ...upazilas].map(
                            (upazila, index) => (
                              <Picker.Item
                                key={index}
                                label={upazila.name}
                                value={upazila.name}
                                enabled={index !== 0}
                              />
                            )
                          )}
                        </Picker>
                      </View>
                      <View style={{ marginTop: 50 }}>
                        <TouchableOpacity
                          onPress={() => {
                            userLocation();
                          }}
                          style={styles.locationBtn}
                        >
                          <Text style={{ fontSize: 15, color: "black" }}>
                            Get Your Current Location
                          </Text>
                        </TouchableOpacity>

                        <MapView
                          style={styles.map}
                          region={{
                            latitude: initialLocation.latitude,
                            longitude: initialLocation.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                          }}
                        >
                          <Marker
                            coordinate={{
                              latitude: initialLocation.latitude,
                              longitude: initialLocation.longitude,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421,
                            }}
                            title="Marker"
                          ></Marker>
                        </MapView>
                      </View>
                      <View style={styles.btnView}>
                        {showMessage ? (
                          <View style={styles.successMessage}>
                            <Text style={{ fontSize: 16 }}>
                              Information Updated Successfully
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={() => handleSubmit()}
                          >
                            <Text style={{ fontSize: 20 }}>Update</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                
              ) : (
                <Loader color="black" />
              )}
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

export default EditProfile;

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
    width: "95%",
    alignSelf: "center",
    paddingBottom: 35,
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
    fontWeight: "bold",
  },
  inputField: {
    display: "flex",
    flexDirection: "column",
    // width : '100%'
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
  pickerStyle: {
    height: 40,
    color: "dimgray",
    backgroundColor: "white",
  },
  btnView: {
    display: "flex",
    marginTop: 70,
  },
  submitBtn: {
    backgroundColor: "seagreen",
    borderRadius: 10,
    width: "100%",
    height: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  successMessage: {
    backgroundColor: "cadetblue",
    borderRadius: 10,
    width: "100%",
    height: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 15,
  },
  locationBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "lightgray",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "black",
  },
});
