import React, { useState, useEffect } from "react";
import { auth } from "./../firebase";
import "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { firebase } from ".././firebase";
import Loader from "./Loader";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import CommentModal from "./CommentModal";
import Pagination from "@cherry-soft/react-native-basic-pagination";

const Home = (props) => {
  const [posts, setPosts] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [userComment, setUserComment] = useState("");
  const [trackPost, setTrackPost] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [page, setPage] = useState(1);

  //fetching current user data
  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      try {
        const doc = await firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .get();

        setCurrentUserInfo(doc.data());
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchCurrentUserInfo();
  }, []);

  //Real time like comment check
  useEffect(() => {
    setLoading(true);
    const unsubscribe = firebase
      .firestore()
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        const updatedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(updatedPosts);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleLike = async (post) => {
    const userLiked = post.likes
      ? post.likes.includes(firebase.auth().currentUser.uid)
      : false;
    const postRef = firebase.firestore().collection("posts").doc(post.post_id);
    try {
      await postRef.update({
        likeCount: !post.likeCount
          ? 1
          : userLiked
          ? firebase.firestore.FieldValue.increment(-1)
          : firebase.firestore.FieldValue.increment(1),
        likes: userLiked
          ? firebase.firestore.FieldValue.arrayRemove(
              firebase.auth().currentUser.uid
            )
          : firebase.firestore.FieldValue.arrayUnion(
              firebase.auth().currentUser.uid
            ),
      });
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleComment = (post) => {
    setCommentModal(true);
    setTrackPost(post);
    try {
      const unsubscribe = firebase
        .firestore()
        .collection("posts")
        .doc(post.post_id)
        .collection("comments")
        .orderBy("createdAt", "asc")
        .onSnapshot((querySnapshot) => {
          const comments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComments(comments);
        });
      return unsubscribe;
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const storeComments = async () => {
    try {
      // console.log(trackpostId)
      // Add document to subcollection
      await firebase
        .firestore()
        .collection("posts")
        .doc(trackPost.post_id)
        .collection("comments")
        .add({
          comment: userComment,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userName: currentUserInfo.f_name + " " + currentUserInfo.l_name,
          image: currentUserInfo.image,
        });
      setUserComment("");
      // Increment count field in the post document
      await firebase
        .firestore()
        .collection("posts")
        .doc(trackPost.post_id)
        .update({
          commentCount: !trackPost.commentCount
            ? 1
            : firebase.firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error("Error adding document to subcollection:", error);
    }
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        <View style={styles.header}>
          <Image source={{ uri: item.author_image }} style={styles.avatar} />
          <View>
            <Text style={styles.author}>{item.author_name}</Text>
            <Text style={{}}>
              {item.timestamp.toDate().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <View style={styles.likeCmntCounter}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              marginLeft: 10,
            }}
          >
            <Text style={{ fontSize: 20 }}>
              Likes : {!item.likeCount ? 0 : item.likeCount} l
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginRight: 5,
            }}
          >
            <Text style={{ fontSize: 20 }}>
              Comments : {!item.commentCount ? 0 : item.commentCount}{" "}
            </Text>
          </View>
        </View>
        <View style={styles.likeCommentContainer}>
          <TouchableOpacity
            onPress={() => handleLike(item)}
            style={styles.likeBtn}
          >
            {item.likes &&
            item.likes.includes(firebase.auth().currentUser.uid) ? (
              <AntDesign name="like1" size={30} color="dodgerblue" />
            ) : (
              <AntDesign name="like2" size={30} color="black" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleComment(item)}
            style={styles.commentBtn}
          >
            <FontAwesome5 name="comment" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
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
        {commentModal ? (
          <CommentModal
            commentModal={commentModal}
            setCommentModal={setCommentModal}
            comments={comments}
            userComment={userComment}
            setUserComment={setUserComment}
            storeComments={storeComments}
            setComments={setComments}
          />
        ) : null}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start", marginLeft: 5 }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("Search");
              }}
              style={{ flexDirection: "row" }}
            >
              <Ionicons name="search-circle-outline" size={40} color="black" />
              <Text style={styles.searchButton}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: 5 }}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("AboutUs");
              }}
              style={{ flexDirection: "row" }}
            >
              <Feather name="info" size={30} color="black" />
              <Text style={styles.searchButton}>About us</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loading === true ? (
          <Loader color="black" />
        ) : (
          <FlatList
            data={posts.slice((page - 1) * 5, page * 5)} // Adjust based on pageSize
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
          />
        )}
        {posts.length > 5 && (
          <View style={styles.PaginationContainer}>
            <Pagination
              totalItems={posts.length}
              pageSize={5}
              currentPage={page}
              onPageChange={setPage}
              btnStyle={{ backgroundColor: "#053363", borderRadius: 10 }}
              activeBtnStyle={{ backgroundColor: "dimgray" }}
            />
          </View>
        )}
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
    height: 412,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
  },
  searchButton: {
    color: "black",
    fontSize: 30,
    fontWeight: "bold",
  },
  likeCommentContainer: {
    height: 40,
    display: "flex",
    flexDirection: "row",
    // borderTopWidth : 1,
    marginTop: 5,
  },
  likeCmntCounter: {
    display: "flex",
    marginTop: 10,
    width: "100%",
    height: 30,
    flexDirection: "row",
  },
  likeBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
    borderRadius: 5,
  },
  commentBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  PaginationContainer: {
    position: "fixed",
    alignSelf: "center",
    bottom: 0,
    width: "100%",
  },
});

export default Home;
