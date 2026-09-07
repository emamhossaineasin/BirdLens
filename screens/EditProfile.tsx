import {
  getAuth,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import {
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState } from 'react';
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

import DateModal from '../components/DateModal';
import Loader from '../components/Loader';
import UploadModal from '../components/UploadModal';
import { db } from '../services/firebase';
import type { UserProfile } from '../types/models';
import type { EditProfileScreenProps } from '../types/navigation';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { formatDateInput } from '../utils/date';
import {
  captureImage,
  selectImageFromLibrary,
} from '../utils/imagePicker';
import { getCurrentCoordinates } from '../utils/location';

type EditableProfile = {
  f_name: string;
  l_name: string;
  phone: string;
};

type Division = {
  id: string;
  name: string;
};

type District = {
  id: string;
  division_id: string;
  name: string;
};

type Upazila = {
  id: string;
  district_id: string;
  name: string;
};

type JsonTable<T> = {
  type: string;
  name: string;
  data: T[];
};

const divisions = (
  require('../assets/divisions.json') as JsonTable<Division>[]
)[2].data;
const districts = (
  require('../assets/districts.json') as JsonTable<District>[]
)[2].data;
const upazilas = (
  require('../assets/upazilas.json') as JsonTable<Upazila>[]
)[2].data;

type EditProfileContentProps = EditProfileScreenProps;

function getProfileDate(value: unknown): Date | null {
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    try {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime())
        ? date
        : null;
    } catch {
      return null;
    }
  }

  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function getCoordinate(value: unknown, fallback: number): number {
  const coordinate =
    typeof value === 'number' ? value : Number(value);

  return Number.isFinite(coordinate) ? coordinate : fallback;
}

function EditProfileContent({
  navigation,
}: EditProfileContentProps): React.JSX.Element {
  const [profile, setProfile] = useState<EditableProfile>({
    f_name: '',
    l_name: '',
    phone: '',
  });
  const [profileImage, setProfileImage] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedUpazila, setSelectedUpazila] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(23.8103);
  const [longitude, setLongitude] = useState(90.4125);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      getAuth(),
      user => {
        unsubscribeProfile?.();
        unsubscribeProfile = null;

        if (!user) {
          setLoadingProfile(false);
          return;
        }

        setLoadingProfile(true);
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', user.uid),
          snapshot => {
            if (!snapshot.exists()) {
              setLoadingProfile(false);
              return;
            }

            const userData = snapshot.data() as UserProfile;

            setProfile({
              f_name: userData.f_name ?? '',
              l_name: userData.l_name ?? '',
              phone: userData.phone ?? '',
            });

            setProfileImage(userData.image ?? '');
            setSelectedDivision(
              userData.division_id ??
                divisions.find(item => item.name === userData.division)?.id ??
                null,
            );
            setSelectedDistrict(
              userData.district_id ??
                districts.find(item => item.name === userData.district)?.id ??
                null,
            );
            setSelectedUpazila(
              userData.upazila_id ??
                upazilas.find(item => item.name === userData.upazila)?.id ??
                null,
            );
            setHasDateOfBirth(Boolean(userData.dob));

            const nextLatitude = getCoordinate(userData.latitude, 23.8103);
            const nextLongitude = getCoordinate(userData.longitude, 90.4125);

            setLatitude(nextLatitude);
            setLongitude(nextLongitude);

            const nextDate = getProfileDate(userData.dob);
            setHasDateOfBirth(nextDate !== null);

            if (nextDate) {
              setDateOfBirth(nextDate);
            }

            setLoadingProfile(false);
          },
          error => {
            console.error('Profile listener failed:', error);
            setLoadingProfile(false);
          },
        );
      },
    );

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const selectedDivisionData = useMemo(
    () => divisions.find(division => division.id === selectedDivision),
    [selectedDivision],
  );

  const availableDistricts = useMemo(
    () =>
      districts.filter(
        district => district.division_id === selectedDivision,
      ),
    [selectedDivision],
  );

  const availableUpazilas = useMemo(
    () =>
      upazilas.filter(upazila => upazila.district_id === selectedDistrict),
    [selectedDistrict],
  );

  const phoneError = useMemo(() => {
    if (!profile.phone) {
      return '';
    }

    return /^01[3-9]\d{8}$/.test(profile.phone)
      ? ''
      : 'Mobile number is invalid.';
  }, [profile.phone]);

  const updateProfileImage = async (uri: string): Promise<void> => {
    const user = getAuth().currentUser;

    if (!user) {
      throw new Error('The authenticated user is unavailable.');
    }

    const imageUrl = await uploadImageToCloudinary(
      uri,
      `profile-${user.uid}-${Date.now()}.jpg`,
    );

    await updateDoc(doc(db, 'users', user.uid), {
      image: imageUrl,
    });
  };

  const pickImage = async (): Promise<void> => {
    try {
      const uri = await selectImageFromLibrary();

      if (!uri) {
        return;
      }

      setUploadingImage(true);
      await updateProfileImage(uri.uri);
    } catch (error: unknown) {
      console.error('Profile image update failed:', error);
      Alert.alert('Upload failed', 'The image could not be uploaded.');
    } finally {
      setUploadingImage(false);
      setUploadModalVisible(false);
    }
  };

  const takePicture = async (): Promise<void> => {
    try {
      const uri = await captureImage();

      if (!uri) {
        return;
      }

      setUploadingImage(true);
      await updateProfileImage(uri.uri);
    } catch (error: unknown) {
      console.error('Profile camera update failed:', error);
      Alert.alert('Upload failed', 'The photo could not be uploaded.');
    } finally {
      setUploadingImage(false);
      setUploadModalVisible(false);
    }
  };

  const requestCurrentLocation = async (): Promise<void> => {
    try {
      const coordinates = await getCurrentCoordinates();

      setLatitude(coordinates.latitude);
      setLongitude(coordinates.longitude);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'The current location could not be retrieved.';

      Alert.alert('Location unavailable', message);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const user = getAuth().currentUser;
    const division = divisions.find(item => item.id === selectedDivision);
    const district = districts.find(item => item.id === selectedDistrict);
    const upazila = upazilas.find(item => item.id === selectedUpazila);

    if (!user) {
      Alert.alert('Authentication required', 'Please log in again.');
      return;
    }

    if (!profile.f_name.trim() || !profile.l_name.trim()) {
      Alert.alert('Missing name', 'Enter your first and last name.');
      return;
    }

    if (phoneError) {
      Alert.alert('Invalid phone', phoneError);
      return;
    }

    try {
      setSavingProfile(true);

      await updateDoc(doc(db, 'users', user.uid), {
        f_name: profile.f_name.trim(),
        l_name: profile.l_name.trim(),
        phone: profile.phone.trim(),
        dob: hasDateOfBirth
          ? Timestamp.fromDate(dateOfBirth)
          : null,
        country: 'Bangladesh',
        division: division?.name ?? null,
        division_id: selectedDivision,
        district: district?.name ?? null,
        district_id: selectedDistrict,
        upazila: upazila?.name ?? null,
        upazila_id: selectedUpazila,
        sub_division: upazila?.name ?? null,
        latitude,
        longitude,
      });

      Alert.alert('Profile updated', 'Your information was saved.');
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      Alert.alert('Update failed', 'Your profile could not be updated.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingProfile) {
    return <Loader text="Loading profile..." />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', {screen: 'Home'})}>
          <Text style={styles.appName}>BirdLens</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', {screen: 'Profile'})}>
          <Text style={styles.profileLink}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <View style={styles.profilePictureContainer}>
          <Image
            style={styles.profileImage}
            source={
              profileImage
                ? {uri: profileImage}
                : require('../assets/images/profile_image.png')
            }
          />

          <TouchableOpacity
            disabled={uploadingImage}
            style={styles.changeImageButton}
            onPress={() => setUploadModalVisible(true)}>
            <Text>
              {uploadingImage ? 'Uploading...' : 'Change Image'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeading}>Edit Information</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={profile.f_name}
          onChangeText={f_name =>
            setProfile(current => ({...current, f_name}))
          }
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={profile.l_name}
          onChangeText={l_name =>
            setProfile(current => ({...current, l_name}))
          }
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={profile.phone}
          onChangeText={phone =>
            setProfile(current => ({...current, phone}))
          }
        />

        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : null}

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDatePickerVisible(true)}>
          <Text style={styles.inputText}>
            {hasDateOfBirth
              ? formatDateInput(dateOfBirth)
              : 'Select date'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Division</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDivision}
            onValueChange={value => {
              setSelectedDivision(value);
              setSelectedDistrict(null);
              setSelectedUpazila(null);
            }}>
            <Picker.Item label="Select division" value={null} />

            {divisions.map(division => (
              <Picker.Item
                key={division.id}
                label={division.name}
                value={division.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>District</Text>
        <View style={styles.pickerContainer}>
          <Picker
            enabled={Boolean(selectedDivisionData)}
            selectedValue={selectedDistrict}
            onValueChange={value => {
              setSelectedDistrict(value);
              setSelectedUpazila(null);
            }}>
            <Picker.Item label="Select district" value={null} />

            {availableDistricts.map(district => (
              <Picker.Item
                key={district.id}
                label={district.name}
                value={district.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Upazila</Text>
        <View style={styles.pickerContainer}>
          <Picker
            enabled={Boolean(selectedDistrict)}
            selectedValue={selectedUpazila}
            onValueChange={setSelectedUpazila}>
            <Picker.Item label="Select upazila" value={null} />

            {availableUpazilas.map(upazila => (
              <Picker.Item
                key={upazila.id}
                label={upazila.name}
                value={upazila.id}
              />
            ))}
          </Picker>
        </View>

        {/* <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            void requestCurrentLocation();
          }}>
          <Text style={styles.locationButtonText}>
            Get current location
          </Text>
        </TouchableOpacity>

        <MapView
          style={styles.map}
          provider="google"
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          <Marker
            coordinate={{latitude, longitude}}
            title="Your location"
          />
        </MapView> */}

        <TouchableOpacity
          disabled={savingProfile}
          style={[
            styles.submitButton,
            savingProfile && styles.disabledButton,
          ]}
          onPress={() => {
            void handleSubmit();
          }}>
          <Text style={styles.submitButtonText}>
            {savingProfile ? 'Updating...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DateModal
        visible={datePickerVisible}
        value={dateOfBirth}
        maximumDate={new Date()}
        onChange={date => {
          setDateOfBirth(date);
          setHasDateOfBirth(true);
        }}
        onClose={() => setDatePickerVisible(false)}
      />

      <UploadModal
        isModalVisible={uploadModalVisible}
        setModalVisible={setUploadModalVisible}
        pickImage={pickImage}
        takePicture={takePicture}
      />
    </View>
  );
}

export default function EditProfile(
  props: EditProfileScreenProps,
): React.JSX.Element {
  return <EditProfileContent {...props} />;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#eee',
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  appName: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileLink: {
    color: '#1877f2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
    paddingBottom: 50,
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profileImage: {
    borderRadius: 75,
    height: 150,
    width: 150,
  },
  changeImageButton: {
    alignItems: 'center',
    backgroundColor: 'cadetblue',
    borderRadius: 10,
    marginTop: 10,
    padding: 8,
    width: 150,
  },
  subHeading: {
    alignSelf: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  input: {
    borderColor: 'dimgray',
    borderRadius: 10,
    borderWidth: 1,
    color: 'black',
    fontSize: 20,
    minHeight: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  inputText: {
    color: 'black',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderColor: 'dimgray',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  locationButton: {
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 30,
    minHeight: 50,
  },
  locationButtonText: {
    color: 'black',
    fontSize: 16,
  },
  map: {
    height: 250,
    marginTop: 15,
    width: '100%',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: 'seagreen',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 30,
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});