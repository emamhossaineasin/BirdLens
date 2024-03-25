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
} from "react-native";
import { firebase } from ".././firebase";
import YoutubePlayer from "react-native-youtube-iframe";
import { Rating } from "react-native-ratings";


const AboutUs = (props) => {
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    // Fetch average rating from Firestore
    fetchAverageRating();
  }, []);

  const fetchAverageRating = async () => {
    const ratingsRef = firebase.firestore().collection("ratings");
    const snapshot = await ratingsRef.get();
    let totalRating = 0;
    let count = 0;
    snapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count++;
    });
    const avgRating = count > 0 ? totalRating / count : 0;
    setAverageRating(avgRating);
  };

  const handleRating = (ratingValue) => {
    setRating(ratingValue);
  };

  useEffect(() => {
    // Fetch previous rating from Firestore or any other data source
    const fetchPreviousRating = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const userRatingRef = firebase.firestore().collection('ratings').doc(userId);
        const userRatingDoc = await userRatingRef.get();
        if (userRatingDoc.exists) {
          // Set the previous rating to the state
          setRating(userRatingDoc.data().rating);
        }
      } catch (error) {
        console.error('Error fetching previous rating:', error);
      }
    };
  
    fetchPreviousRating();
  }, []);

  const handleSaveRating = async () => {
    try {
      // Check if the user has already rated
      const userId = firebase.auth().currentUser.uid;
      const userRatingRef = firebase
        .firestore()
        .collection("ratings")
        .doc(userId);
      const userRatingDoc = await userRatingRef.get();
      if (userRatingDoc.exists) {
        // Update existing rating
        await userRatingRef.update({ rating });
        alert("Rating updated successfully")
      } else {
        // Add new rating
        await userRatingRef.set({ rating });
        alert("Rating submitted successfully")
      }
      // Update average rating
      fetchAverageRating();
    } catch (error) {
      console.error("Error saving rating:", error);
    }
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
          flex: 20,
        }}
      >
        <View style={{ flex: 1 }}>
          <YoutubePlayer
            height={300}
            videoId="G-rsmbK7gdY"
            play={true}
            fullscreen={true}
            loop={false}
            style={{ alignSelf: "stretch", height: 300 }}
          />
        </View>
        <View style={styles.ratingContainer}>
          <Text style={{fontSize: 25}}>Rate this App:</Text>
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
          <Text style={{fontSize: 25}}>Average Rating: {averageRating.toFixed(2)}</Text>
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
  ratingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  
});

export default AboutUs;
