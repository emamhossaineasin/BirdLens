import { StyleSheet, Text, View, TouchableOpacity, Platform, FlatList, Dimensions, useWindowDimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Uploading } from "../../../components/Uploading";
import * as ImagePicker from "expo-image-picker";
import ToastNotification from '../../../components/Toast';
import { ResizeMode } from "expo-av";
import VideoPlayer from 'expo-video-player'
import { UploadingAndroid } from "../../../components/UploadingAndroid";
import VideoUploadModal from '../../../components/VideoUploadModal'
import Pagination from '@cherry-soft/react-native-basic-pagination';
import { Entypo } from '@expo/vector-icons';
import { setStatusBarHidden } from 'expo-status-bar'
import * as ScreenOrientation from 'expo-screen-orientation'
import { firebase } from '../../../config'
import CommentModal from '../../../components/CommentModal';

const Videos = ({ route }) => {
  const navigation = useNavigation()
  const courseId = route.params.courseId;
  const [video, setVideo] = useState("");
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [videoTitle, setVideoTitle] = useState('')
  const [page, setPage] = useState(1);
  const [inFullscreen2, setInFullscreen2] = useState(false)
  const [isMute, setIsMute] = useState(false)
  const refVideo2 = useRef(null)
  const [videos, setVideos] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const refScrollView = useRef(null)
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [trackVideo, setTrackVideo] = useState('');

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      try {
        const doc = await firebase
          .firestore()
          .collection('users')
          .doc(firebase.auth().currentUser.uid)
          .get();

        setCurrentUserInfo(doc.data());
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchCurrentUserInfo();
  }, []);


  const fetchVideos = () => {
    const unsubscribe = firebase
      .firestore()
      .collection('Videos')
      .where('course_id', '==', courseId)
      .onSnapshot((querySnapshot) => {
        const videoData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(videoData);
      });

    return unsubscribe;
  }

  const fetchCourseInfo = () => {
    const unsubscribe = firebase
      .firestore()
      .collection('courses')
      .doc(courseId)
      .onSnapshot((doc) => {
        setCourseTitle(doc.data().title);
      });

    return unsubscribe;
  }

  useEffect(() => {
    fetchVideos();
    fetchCourseInfo();
  }, [courseId]);



  async function pickVideo() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
      await uploadVideo(result.assets[0].uri);
    }
  }

  async function uploadVideo(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref().child("Videos/" + new Date().getTime());
      const uploadTask = storageRef.put(blob);

      // Listen for events
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log("Upload is " + progress + "% done");
          setProgress(progress.toFixed());
        },
        (error) => {
          // Handle error
          console.error("Error uploading video:", error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            // console.log("File available at", downloadURL);

            // Save record
            saveRecord(downloadURL, new Date().toISOString());
            setVideo("");
            setShowToast(true)
            setTimeout(() => {
              setShowToast(false);
            }, 5000);
          } catch (downloadError) {
            console.error("Error getting download URL:", downloadError);
          }
        }
      );
    } catch (fetchError) {
      console.error("Error fetching video:", fetchError);
    }
  }


  async function saveRecord(url, createdAt) {
    const user_id = firebase.auth().currentUser.uid
    await firebase.firestore().collection("Videos").add({
      course_id: courseId,
      teacher_id: user_id,
      video_title: videoTitle,
      video: url,
      uploadedAt: createdAt,
    })
      .then((docRef) => {
        return docRef.update({ video_id: docRef.id });
      })
      .then(() => {
        // console.log("Document updated with fileId");
        setVideoTitle('');
      })
      .catch((error) => {
        console.error("Error saving document:", error);
      });
  }

  const handleLike = async (video) => {
    const userLiked = video.likes ? video.likes.includes(firebase.auth().currentUser.uid) : false;
    const videoRef = firebase.firestore().collection('Videos').doc(video.video_id);
    try {
      await videoRef.update({
        likeCount: !video.likeCount ? 1 : userLiked ? firebase.firestore.FieldValue.increment(-1) : firebase.firestore.FieldValue.increment(1),
        likes: userLiked ? firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid) : firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
      });
    } catch (error) {
      console.error('Error updating likes: ', error);
    }
  }

  const handleComment = (video) => {
    setCommentModal(true);
    setTrackVideo(video);
    try {
      const unsubscribe = firebase
        .firestore()
        .collection('Videos')
        .doc(video.video_id)
        .collection('comments')
        .orderBy('createdAt', 'asc') 
        .onSnapshot((querySnapshot) => {
          const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setComments(comments);
        });
      return unsubscribe;
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };
  
  const storeComments = async() => {
    try {
      // console.log(trackVideoId)
      // Add document to subcollection
      await firebase.firestore().collection('Videos').doc(trackVideo.video_id).collection('comments').add({
        comment: userComment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        userName: currentUserInfo.name,
        image: currentUserInfo.image,
      });
      setUserComment('')
      // Increment count field in the video document
      await firebase.firestore().collection('Videos').doc(trackVideo.video_id).update({
        commentCount: !trackVideo.commentCount ? 1 : firebase.firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('Error adding document to subcollection:', error);
    }
  };
  
  const renderVideoItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <View style={styles.videoHeading}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{courseTitle}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={() => { alert('pressed') }}>
            <Entypo name="dots-three-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>

      </View>
      <VideoPlayer
        videoProps={{
          shouldPlay: false,
          resizeMode: ResizeMode.CONTAIN,
          source: {
            uri: item.video,
          },
          ref: refVideo2,
        }}

        icon={{
          pause: <AntDesign name="pausecircleo" size={35} color="white" />,
          play: <AntDesign name="playcircleo" size={35} color="white" />,
        }}

        mute={{
          enterMute: () => setIsMute(!isMute),
          exitMute: () => setIsMute(!isMute),
          isMute,
        }}

        fullscreen={{
          inFullscreen: inFullscreen2,
          enterFullscreen: async () => {
            setStatusBarHidden(true, 'fade')
            setInFullscreen2(!inFullscreen2)
            //  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT)
            refVideo2.current.setStatusAsync({
              shouldPlay: true,
            })
          },
          exitFullscreen: async () => {
            setStatusBarHidden(false, 'fade')
            setInFullscreen2(!inFullscreen2)
            // await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT)
          },
        }}
        style={{
          videoBackgroundColor: 'black',
          height: inFullscreen2 ? screenWidth : 260,
          width: inFullscreen2 ? screenHeight : 350,
        }}
      />
      <Text style={styles.videoTitle}>{item.video_title}</Text>
      <View style={styles.likeCmntCounter}>
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 16 }}>Likes : {!item.likeCount ? 0 : item.likeCount}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 16 }}>Comments : {!item.commentCount ? 0 : item.commentCount} </Text>
        </View>
      </View>
      <View style={styles.likeCommentContainer}>
        <TouchableOpacity onPress={() => handleLike(item)} style={styles.likeBtn}>
          {(item.likes && item.likes.includes(firebase.auth().currentUser.uid)) ? <AntDesign name="like1" size={30} color="dodgerblue" /> : <AntDesign name="like2" size={30} color="black" />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleComment(item)} style={styles.commentBtn}>
          <FontAwesome5 name="comment" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {isModalVisible ? <VideoUploadModal isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        videoTitle={videoTitle}
        setVideoTitle={setVideoTitle}
        pickVideo={pickVideo} /> : null}
      {commentModal ? <CommentModal commentModal={commentModal}
        setCommentModal={setCommentModal}
        comments={comments}
        userComment={userComment}
        setUserComment={setUserComment} 
        storeComments={storeComments}
        setComments={setComments}/> : null}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome5 name="arrow-left" size={20} color="black" />
        <Text style={{ fontSize: 16 }}> Go Back</Text>
      </TouchableOpacity>
      <View style={styles.heading}>
        <View style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'row' }}>
          <Octicons name="video" size={30} color="black" />
          <Text style={{ fontSize: 25 }}> Videos</Text>
        </View>
        <TouchableOpacity onPress={() => { setIsModalVisible(true) }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row', marginTop: 5 }}>
            <Feather name="upload" size={24} color="black" />
            <Text style={{ fontSize: 16, marginVertical: 2 }}>UPLOAD</Text>
          </View>
        </TouchableOpacity>
      </View>
      {videos.length == 0 ? <Text style={{ alignSelf: 'center', marginTop: 200, fontSize: 20 }}>No videos <Entypo name="emoji-sad" size={22} color="black" /></Text> : null}
      <View style={styles.FlatListContainer}>
        <FlatList
          data={videos.slice((page - 1) * 5, page * 5)} // Adjust based on pageSize
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {videos.length > 5 && <View style={styles.PaginationContainer}><Pagination
        totalItems={videos.length}
        pageSize={5}
        currentPage={page}
        onPageChange={setPage}
        btnStyle={{ backgroundColor: 'black', borderRadius: 10 }}
        activeBtnStyle={{ backgroundColor: 'dimgray' }}
      /></View>}

      {video &&
        (Platform.OS === "ios" ? (
          <Uploading video={video} progress={progress} />
        ) : (
          // Some features of blur are not available on Android
          <UploadingAndroid video={video} progress={progress} />
        ))}
      {showToast ? <ToastNotification
        icon={<AntDesign name="checkcircle" size={27} color="white" />}
        message='Video Uploaded Successfully'
        color="green"
        bottom={30} /> : null}
    </View>
  )
}

export default Videos

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // marginTop: 120,
    flexDirection: 'column'
  },
  backButton: {
    marginLeft: 15,
    display: 'flex',
    flexDirection: 'row',
    marginTop: 130,
    width: '90%',
    justifyContent: 'flex-start'
  },
  heading: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    width: '90%'
  },
  content: {
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
    // flex: 1

  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '90%',
    marginTop: 10
  },
  videoContainer: {
    borderWidth: 2,
    padding: 5,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  videoHeading: {
    height: 25,
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
  }
  ,
  videoTitle: {
    fontSize: 17,
    marginTop: 10,
    fontWeight: 'bold'
  }
  ,
  FlatListContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 15,
    height: 550
  },
  likeCommentContainer: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    // borderTopWidth : 1,
    marginTop: 5
  },
  likeCmntCounter: {
    display: 'flex',
    marginTop: 10,
    width: '100%',
    height: 20,
    flexDirection: 'row',
  }
  ,
  likeBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    padding: 3,
    borderRadius: 5
  },
  commentBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  PaginationContainer: {
    position: 'fixed',
    alignSelf: 'center',
    bottom: 0,
    width: '100%'
  }
})