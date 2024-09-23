import React, { useState, useEffect } from "react";
import "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { firebase, db } from ".././firebase";
import UploadModal from "./UploadModal";
import * as ImagePicker from "expo-image-picker";
import "firebase/storage";

const CreatePost = (props) => {
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const storage = firebase.storage();

  useEffect(() => {
    const fetchData = () => {
      try {
        const userDocRef = firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid);

        // Use onSnapshot to listen for real-time updates
        const unsubscribe = userDocRef.onSnapshot((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
          } else {
            // Handle the case where the document doesn't exist
            setUserData(null);
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

  const handleCreatePost = async () => {
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const imageName = selectedImage.split("/").pop();
      const ref = storage.ref().child(`images/${imageName}`);
      await ref.put(blob);
      const imageURL = await ref.getDownloadURL();

      try {
        await firebase
          .firestore()
          .collection("posts")
          .add({
            message: postContent,
            author_name: userData.f_name + " " + userData.l_name,
            author_id: userData.user_id,
            author_image: userData.image,
            likeCount: 0,
            commentCount: 0,
            image: imageURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then((docRef) => {
            return docRef.update({ post_id: docRef.id });
          })
          .then(() => {
            setPostContent("");
            setSelectedImage(null);
            props.navigation.navigate("Profile");
          })
          .catch((error) => {
            console.error("Error saving document:", error);
          });
      } catch (error) {
        console.error("Error creating post:", error);
      }
    } catch (error) {
      console.error("Error uploading image: ", error);
      return null;
    }
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
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  const openModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={{ marginTop: 0, flex: 1, backgroundColor: "#eee" }}>
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
            onPress={() => props.navigation.navigate("Profile")}
          >
            <Text style={styles.profileLink}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flex: 16,
        }}
      >
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
        <View style={styles.createPost}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            multiline={true}
            placeholderTextColor={"dimgray"}
            cursorColor={"black"}
            onChangeText={(text) => setPostContent(text)}
          />
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "100%", height: 412 }}
              resizeMode="contain"
            />
          )}
          {selectedImage && (
            <TouchableOpacity onPress={openModal} style={styles.button}>
              <Text style={styles.buttonText}>Change Image</Text>
            </TouchableOpacity>
          )}
          {!selectedImage && (
            <TouchableOpacity onPress={openModal} style={styles.button}>
              <Text style={styles.buttonText}>Choose Image</Text>
            </TouchableOpacity>
          )}

          {selectedImage && (
            <TouchableOpacity onPress={handleCreatePost} style={styles.button}>
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
          )}
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
  appName: {
    color: "black",
    fontSize: 40,
    fontWeight: "bold",
  },
  profileLink: {
    color: "#1877f2", // Facebook blue color
    fontWeight: "bold",
    fontSize: 20,
  },
  postContainer: {
    backgroundColor: "#ffffff",
    marginBottom: 10,
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
  button: {
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
  input: {
    // width: '95%',
    fontSize: 20,
    color: "black",
    padding: 5,
    marginLeft: 5,
    marginRight: 5,
  },
  createPost: {
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
  },
});

export default CreatePost;
