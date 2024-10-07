import React, { useState, useEffect } from "react";
import { auth } from "./../firebase";
import "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { firebase } from ".././firebase";
import YoutubePlayer from "react-native-youtube-iframe";
import { Rating } from "react-native-ratings";
import { ProgressChart } from "react-native-chart-kit";

const AboutUs = (props) => {
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    // Fetch average rating from Firestore
    fetchAverageRating();
    // Fetch previous rating from Firestore
    fetchPreviousRating();
  }, []);

  const fetchAverageRating = async () => {
    const usersRef = firebase.firestore().collection("users");
    const snapshot = await usersRef.get();
    let totalRating = 0;
    let count = 0;
    snapshot.forEach((doc) => {
      if (doc.exists && doc.data().rating) {
        totalRating += doc.data().rating;
        count++;
      }
    });
    const avgRating = count > 0 ? totalRating / count : 0;
    setAverageRating(avgRating);
  };

  const fetchPreviousRating = async () => {
    try {
      const userRef = firebase.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists && userDoc.data().rating) {
        // Set the previous rating to the state
        setRating(userDoc.data().rating);
      }
    } catch (error) {
      console.error("Error fetching previous rating:", error);
    }
  };

  const handleRating = (ratingValue) => {
    setRating(ratingValue);
  };

  const handleSaveRating = async () => {
    try {
      const userRef = firebase.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        // Update or set the rating in the user document
        await userRef.set({ rating }, { merge: true });
        alert("Rating submitted successfully");
        // Update average rating
        fetchAverageRating();
      }
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const data = {
    labels: ["rating"], // optional
    data: [averageRating/5],
  };

  const remark = [
    "Unsatisfactory",
    "Poor",
    "Weak",
    "Below Average",
    "Average",
    "Fair",
    "Good",
    "Very Good",
    "Excellent",
    "Outstanding",
  ];

  const chartConfig = {
    backgroundGradientFrom: "#696969",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#808080",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(30,144,255, ${opacity})`,
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
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
          backgroundColor: "#fff",
        }}
      >
        <ScrollView>
          <View style={{ flex: 1 }}>
            <YoutubePlayer
              height={300}
              videoId="G-rsmbK7gdY"
              play={false}
              fullscreen={true}
              loop={false}
              style={{ alignSelf: "stretch", height: 300 }}
            />
          </View>
          <View style={styles.ratingContainer}>
            <Text style={{ fontSize: 25 }}>Rate this App: </Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={40}
              startingValue={rating}
              onFinishRating={handleRating}
            />
            <TouchableOpacity
              onPress={handleSaveRating}
              style={styles.rattingButton}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 25 }}>
              Average Rating: {averageRating.toFixed(2)} r
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.pChart}>
              <ProgressChart
                data={data}
                width={Dimensions.get("window").width - 20}
                height={220}
                strokeWidth={30}
                radius={80}
                chartConfig={chartConfig}
                hideLegend={true}
              />
              <Text style={styles.myText}>{data.data[0].toFixed(4) * 100 + "%"} </Text>
            </View>
          </View>
        </ScrollView>
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
  ratingContainer: {
    flex: 1,
    //justifyContent: "top",
    alignItems: "center",
  },
  rattingButton: {
    backgroundColor: "#1877f2", // Facebook blue color
    padding: 8,
    borderRadius: 10,
    width: "25%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  pChart:{
    marginTop : 20,
    justifyContent : 'center',
    alignItems : 'center'
  },
});

export default AboutUs;
