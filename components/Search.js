import React, { useState, useEffect } from "react";
import "firebase/auth";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { firebase } from ".././firebase";
import UploadModal from "./UploadModal";
import * as ImagePicker from "expo-image-picker";
import * as tf from "@tensorflow/tfjs";
import * as FileSystem from "expo-file-system";
import {
  bundleResourceIO,
  decodeJpeg,
  fetch,
} from "@tensorflow/tfjs-react-native";

const modelJson = require("./../assets/trained_model/model.json");
const modelWeights = require("./../assets/trained_model/weights.bin");

const datasetClasses = [
  "Asian Koel (Kokil)",
  "Black Drongo (Kalo Finge)",
  "Black-Winged Kite (Chil)",
  "Common Myna (Shalik)",
  "Common Tailorbird (Tuntuni)",
  "Coppersmith Barbet (Basanta Bouri)",
  "Heron (Bok)",
  "House Crow (Kak)",
  "Indian Roller (Neelkanth)",
  "Kingfisher (Machranga)",
  "Little Cormorant (Pankouri)",
  "Oriental Magpie Robin (Doel)",
  "Owl (Pecha)",
  "Perrot (Tiya)",
  "Red Vented Bulbul (Bulbuli)",
  "Red Wattled Lapwing (Lal Latika Hottiti)",
  "White Breasted Waterhen (Dahuk)",
  "White Rumped Shama (Shama)",
];

const transformImageToTensor = async (uri) => {
  //read the image as base64
  const img64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imgBuffer = tf.util.encodeString(img64, "base64").buffer;
  const raw = new Uint8Array(imgBuffer);
  let imgTensor = decodeJpeg(raw);
  const scalar = tf.scalar(255);
  //resize the image
  imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [224, 224]);
  //normalize; if a normalization layer is in the model, this step can be skipped
  const tensorScaled = imgTensor.div(scalar);
  //final shape of the tensor
  const img = tf.reshape(tensorScaled, [1, 224, 224, 3]);
  return img;
};

const Search = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [model, setModel] = useState();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    // console.log(result)
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      await tf.ready();
      const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
      );
      setModel(model);
      const imageTensor = await transformImageToTensor(result.assets[0].uri);
      const predictions = model.predict(imageTensor);
      console.log(predictions);
      const highestPredictionIndex = predictions.argMax(1).dataSync();
      
      const predictedClass = `${datasetClasses[highestPredictionIndex]}`;
      setPrediction(predictedClass);
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
      setImageUri(result.assets[0].uri);
      await tf.ready();
      const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
      );
      setModel(model);
      const imageTensor = await transformImageToTensor(result.assets[0].uri);
      const predictions = model.predict(imageTensor);
      const highestPredictionIndex = predictions.argMax(1).dataSync();
      
      const predictedClass = `${datasetClasses[highestPredictionIndex]}`;
      setPrediction(predictedClass);
      setModalVisible(false);
    }
  };

  const openModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleChangeImage = () => {
    setPrediction("");
    setImageUri(null);
    openModal();
  }

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
          {prediction && (
            <View style={styles.predictionBox} >
                <Text style={styles.prediction}>Prediction: {prediction}</Text>
            </View>
            
          )}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 412 }}
              resizeMode="contain"
            />
          )}
          {imageUri && (
            <TouchableOpacity onPress={handleChangeImage} style={styles.button}>
              <Text style={styles.buttonText}>Change Image</Text>
            </TouchableOpacity>
          )}
          {!imageUri && (
            <TouchableOpacity onPress={openModal} style={styles.button}>
              <Text style={styles.buttonText}>Choose Image</Text>
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
  prediction: {
    fontSize: 25,
    alignItems: "center",
    fontWeight: "bold",
  },
  predictionBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  }
});

export default Search;
