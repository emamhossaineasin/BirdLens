import { getAuth } from '@react-native-firebase/auth';
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import Loader from '../components/Loader';
import UploadModal from '../components/UploadModal';
import { db } from '../services/firebase';
import type { UserProfile } from '../types/models';
import type { CreatePostScreenProps } from '../types/navigation';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import {
    captureImage,
    selectImageFromLibrary,
} from '../utils/imagePicker';

export default function CreatePost({
  navigation,
}: CreatePostScreenProps): React.JSX.Element {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = getAuth().currentUser;

    if (!user) {
      setLoadingUser(false);
      return;
    }

    const userReference = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userReference,
      snapshot => {
        setUserData(
          snapshot.exists()
            ? (snapshot.data() as UserProfile)
            : null,
        );
        setLoadingUser(false);
      },
      error => {
        console.error('Failed to load profile:', error);
        setLoadingUser(false);
      },
    );

    return unsubscribe;
  }, []);

  const pickImage = async (): Promise<void> => {
    try {
      const uri = await selectImageFromLibrary();

      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error: unknown) {
      console.error('Image selection failed:', error);
      Alert.alert('Image error', 'The image could not be selected.');
    } finally {
      setModalVisible(false);
    }
  };

  const takePicture = async (): Promise<void> => {
    try {
      const uri = await captureImage();

      if (uri) {
        setSelectedImage(uri);
      }
    } catch (error: unknown) {
      console.error('Camera failed:', error);
      Alert.alert('Camera error', 'The camera could not be opened.');
    } finally {
      setModalVisible(false);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    return uploadImageToCloudinary(uri, `post-${Date.now()}.jpg`);
  };

  const handleCreatePost = async (): Promise<void> => {
    const user = getAuth().currentUser;

    if (!user) {
      Alert.alert('Authentication required', 'Please log in again.');
      return;
    }

    if (!userData) {
      Alert.alert('Profile unavailable', 'Your profile could not be loaded.');
      return;
    }

    if (!postContent.trim()) {
      Alert.alert('Missing message', 'Enter a message for your post.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Missing image', 'Choose an image for your post.');
      return;
    }

    try {
      setSubmitting(true);

      const imageUrl = await uploadImage(selectedImage);

      const postReference = await addDoc(collection(db, 'posts'), {
        message: postContent.trim(),
        author_name: `${userData.f_name} ${userData.l_name}`,
        author_id: user.uid,
        author_image: userData.image,
        image: imageUrl,
        likeCount: 0,
        commentCount: 0,
        likes: [],
        timestamp: serverTimestamp(),
      });

      await updateDoc(postReference, {
        post_id: postReference.id,
      });

      setPostContent('');
      setSelectedImage(null);

      navigation.navigate('Profile');
    } catch (error: unknown) {
      console.error('Post creation failed:', error);
      Alert.alert('Post failed', 'Your post could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return <Loader text="Loading profile..." />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.appName}>BirdLens</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileLink}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="dimgray"
          multiline
          value={postContent}
          onChangeText={setPostContent}
        />

        {selectedImage ? (
          <Image
            source={{uri: selectedImage}}
            style={styles.selectedImage}
            resizeMode="contain"
          />
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>
            {selectedImage ? 'Change Image' : 'Choose Image'}
          </Text>
        </TouchableOpacity>

        {selectedImage ? (
          <TouchableOpacity
            style={[
              styles.button,
              submitting && styles.disabledButton,
            ]}
            disabled={submitting}
            onPress={handleCreatePost}>
            <Text style={styles.buttonText}>
              {submitting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <UploadModal
        isModalVisible={modalVisible}
        setModalVisible={setModalVisible}
        pickImage={pickImage}
        takePicture={takePicture}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#eee',
    flex: 1,
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  appName: {
    color: 'black',
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileLink: {
    color: '#1877f2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    color: 'black',
    fontSize: 20,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
  selectedImage: {
    backgroundColor: 'white',
    height: 412,
    marginTop: 10,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1877f2',
    borderRadius: 10,
    marginTop: 10,
    padding: 12,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});