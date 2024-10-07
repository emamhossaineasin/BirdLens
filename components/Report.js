import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { firebase } from ".././firebase";
import Chart from "./Chart";

const Report = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  useEffect(() => {
    // Fetch average rating from Firestore
    fetchAverageRating();
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

  // console.log(select)
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <FontAwesome5 name="arrow-left" size={20} color="black" />
        <Text style={{ fontSize: 16 }}> Go Back</Text>
      </TouchableOpacity>
      {loading === false ? (
        <View style={styles.page}>
          <ScrollView
            horizontal={true}
            style={styles.scrollView}
            showsHorizontalScrollIndicator={false}
          >
            {data.length > 0 &&
              data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.item,
                    {
                      backgroundColor:
                        select && item.course_title === select.course_title
                          ? "crimson"
                          : "#C0C0C0",
                    },
                  ]}
                >
                  <Text>{item.course_title}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
          {select && <Chart data={select} />}
        </View>
      ) : (
        <ActivityIndicator size={"large"} color={"blue"} />
      )}
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  backButton: {
    marginLeft: 15,
    display: "flex",
    flexDirection: "row",
    marginTop: 130,
    width: "90%",
    justifyContent: "flex-start",
  },
  item: {
    width: 150,
    height: 70,
    borderRadius: 35,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    marginTop: 10,
    width: "95%",
    alignSelf: "center",
  },
});
