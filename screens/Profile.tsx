import {
  getAuth,
  signOut,
} from '@react-native-firebase/auth';
import {
  doc,
  getFirestore,
  onSnapshot,
  type Timestamp,
} from '@react-native-firebase/firestore';
import {
  Feather,
} from '@react-native-vector-icons/feather';
import {
  FontAwesome6,
} from '@react-native-vector-icons/fontawesome6';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import MapView, {
  Marker,
  type LatLng,
  type Region,
} from 'react-native-maps';

/*
 * Keep this route definition in one shared file later.
 * It is included here for now so Profile.tsx is complete
 * and can compile independently.
 */
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  CreatePost: undefined;
  EditProfile: undefined;
  Search: undefined;
  AboutUs: undefined;
};

type ProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Profile'
>;

/*
 * Your old database may contain empty strings for dob,
 * latitude, and longitude. These types accept that legacy
 * data while the new EditProfile screen transitions those
 * fields to null, Timestamp, or number.
 */
type UserProfileDocument = {
  user_id?: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  phone?: string;
  image?: string;

  dob?:
    | Timestamp
    | string
    | null;

  country?: string | null;
  sub_division?: string | null;

  /*
   * The original Signup.js used division instead of
   * sub_division. Keep it temporarily for old profiles.
   */
  division?: string | null;

  latitude?: number | string | null;
  longitude?: number | string | null;
  rating?: number;
};

const DEFAULT_LATITUDE_DELTA = 0.0922;
const DEFAULT_LONGITUDE_DELTA = 0.0421;

function getNonEmptyText(
  value: string | null | undefined,
  fallback = 'Not Provided Yet',
): string {
  const normalizedValue = value?.trim();

  return normalizedValue
    ? normalizedValue
    : fallback;
}

function getCoordinate(
  value: number | string | null | undefined,
): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : null;
  }

  return null;
}

function formatDateOfBirth(
  value:
    | Timestamp
    | string
    | null
    | undefined,
): string {
  if (!value) {
    return 'Not Provided Yet';
  }

  /*
   * Support legacy string values while data is migrated.
   */
  if (typeof value === 'string') {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return 'Not Provided Yet';
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return normalizedValue;
    }

    return parsedDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  try {
    const date = value.toDate();

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error: unknown) {
    console.error(
      'Unable to format date of birth:',
      error,
    );

    return 'Not Provided Yet';
  }
}

export default function Profile({
  navigation,
}: ProfileScreenProps): React.JSX.Element {
  const [userData, setUserData] = useState<UserProfileDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      setLoadError(
        'No authenticated user is available.',
      );
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setLoadError(null);
    const firestore = getFirestore();
    const userReference = doc(
      firestore,
      'users',
      currentUser.uid,
    );
    const unsubscribe = onSnapshot(
      userReference,
      snapshot => {
        if (!snapshot.exists()) {
          setUserData(null);
          setLoadError(
            'No profile document was found for this account.',
          );
          setLoading(false);
          return;
        }
        const profileData =
          snapshot.data() as UserProfileDocument;
        setUserData(profileData);
        setLoadError(null);
        setLoading(false);
      },
      error => {
        console.error(
          'Error loading profile:',
          error,
        );
        setUserData(null);
        setLoadError(
          'Your profile information could not be loaded.',
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const fullName = useMemo<string>(() => {
    if (!userData) {
      return '';
    }
    const firstName = userData.f_name?.trim() ?? '';
    const lastName = userData.l_name?.trim() ?? '';
    const name = `${firstName} ${lastName}`.trim();
    return name || 'BirdLens User';
  }, [userData]);

  const formattedDateOfBirth = useMemo<string>(
    () => formatDateOfBirth(userData?.dob),
    [userData?.dob],
  );

  const formattedAddress = useMemo<string>(() => {
    if (!userData) {
      return 'Not Provided Yet';
    }
    const country =
      userData.country?.trim() ?? '';

    const subdivision =
      userData.sub_division?.trim() ||
      userData.division?.trim() ||
      '';

    if (country && subdivision) {
      return `${country}, ${subdivision}`;
    }
    if (country) {
      return country;
    }
    if (subdivision) {
      return subdivision;
    }
    return 'Not Provided Yet';
  }, [userData]);
  const mapCoordinates = useMemo<LatLng | null>(() => {
    const latitude = getCoordinate(
      userData?.latitude,
    );
    const longitude = getCoordinate(
      userData?.longitude,
    );
    if (latitude === null || longitude === null) {
      return null;
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return null;
    }

    return {
      latitude,
      longitude,
    };
  }, [userData?.latitude, userData?.longitude]);

  const mapRegion = useMemo<Region | null>(() => {
    if (!mapCoordinates) {
      return null;
    }
    return {
      latitude: mapCoordinates.latitude,
      longitude: mapCoordinates.longitude,
      latitudeDelta: DEFAULT_LATITUDE_DELTA,
      longitudeDelta: DEFAULT_LONGITUDE_DELTA,
    };
  }, [mapCoordinates]);

  const profileImageSource =
    useMemo<ImageSourcePropType>(() => {
      const imageUrl = userData?.image?.trim();
      if (imageUrl) {
        return { uri: imageUrl, };
      }
      return require('../assets/images/profile_image.png');
    }, [userData?.image]);

  const handleLogout = async (): Promise<void> => {
    if (loggingOut) {
      return;
    }
    try {
      setLoggingOut(true);
      await signOut(getAuth());
    } catch (error: unknown) {
      console.error('Logout failed:', error);

      Alert.alert(
        'Logout failed',
        'BirdLens could not log you out. Please try again.',
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleEditProfile = (): void => {
    navigation.navigate('EditProfile');
  };

  const handleCreatePost = (): void => {
    navigation.navigate('CreatePost');
  };

  const handleGoHome = (): void => {
    navigation.navigate('Home');
  };

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator
          size="large"
          color="#1877f2"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.errorTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {loadError ??
            'No user profile data is available.'}
        </Text>

        <TouchableOpacity
          disabled={loggingOut}
          style={[
            styles.logoutActionButton,
            loggingOut && styles.disabledButton,
          ]}
          onPress={() => {
            void handleLogout();
          }}>
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color="white"
            />
          ) : (
            <Text style={styles.logoutActionButtonText}>
              Log Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go to home"
          onPress={handleGoHome}>
          <Text style={styles.appName}>
            BirdLens
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Log out"
          disabled={loggingOut}
          onPress={() => {
            void handleLogout();
          }}>
          {loggingOut ? (
            <ActivityIndicator
              size="small"
              color="#1877f2"
            />
          ) : (
            <Text style={styles.logoutLink}>
              Logout
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }>
        <View style={styles.profileHeading}>
          <View style={styles.headingTitleContainer}>
            <FontAwesome6
              name="circle-user"
              iconStyle="regular"
              size={30}
              color="black"
            />

            <Text style={styles.headingText}>
              Profile
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={styles.editButton}
            onPress={handleEditProfile}>
            <Feather
              name="edit"
              size={24}
              color="black"
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileContent}>
          <Image
            source={profileImageSource}
            style={styles.profileImage}
            resizeMode="cover"
            onError={event => {
              console.error(
                'Profile image failed to load:',
                event.nativeEvent.error,
              );
            }}
          />

          <Text style={styles.name}>
            {fullName}
          </Text>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>
              Details
            </Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              <Text style={styles.infoValue}>
                {getNonEmptyText(userData.email)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Phone
              </Text>

              <Text style={styles.infoValue}>
                {getNonEmptyText(userData.phone)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Date of Birth
              </Text>

              <Text style={styles.infoValue}>
                {formattedDateOfBirth}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Address
              </Text>

              <Text style={styles.infoValue}>
                {formattedAddress}
              </Text>
            </View>
          </View>

          {mapCoordinates && mapRegion ? (
            <View style={styles.locationSection}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  showMap
                    ? 'Hide saved map location'
                    : 'Show saved map location'
                }
                style={styles.mapToggleButton}
                onPress={() => {
                  setShowMap(current => !current);
                }}>
                <Feather
                  name="map-pin"
                  size={24}
                  color="#1877f2"
                />

                <Text style={styles.mapToggleText}>
                  {showMap
                    ? 'Hide Map Location'
                    : 'Show Map Location'}
                </Text>
              </TouchableOpacity>

              {showMap ? (
                <MapView
                  style={styles.map}
                  provider="google"
                  region={mapRegion}>
                  <Marker
                    coordinate={mapCoordinates}
                    title="Saved location"
                    description="Your saved BirdLens profile location"
                  />
                </MapView>
              ) : null}
            </View>
          ) : (
            <View style={styles.noLocationContainer}>
              <Feather
                name="map-pin"
                size={21}
                color="gray"
              />

              <Text style={styles.noLocationText}>
                No map location has been saved.
              </Text>
            </View>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Create a post"
            style={styles.createPostButton}
            onPress={handleCreatePost}>
            <Text style={styles.createPostButtonText}>
              Create a Post
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appName: {
    color: '#000000',
    fontSize: 30,
    fontWeight: 'bold',
  },

  logoutLink: {
    color: '#1877f2',
    fontSize: 20,
    fontWeight: 'bold',
  },

  centeredScreen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#808080',
    fontSize: 17,
    textAlign: 'center',
  },

  errorTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  errorMessage: {
    marginTop: 8,
    color: '#555555',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },

  logoutActionButton: {
    minWidth: 140,
    minHeight: 46,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1877f2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutActionButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.5,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },

  profileHeading: {
    width: '95%',
    marginTop: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headingText: {
    marginLeft: 7,
    color: '#000000',
    fontSize: 25,
    fontWeight: '500',
  },

  editButton: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  editButtonText: {
    marginLeft: 5,
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  profileContent: {
    width: '95%',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },

  profileImage: {
    width: 150,
    height: 150,
    backgroundColor: '#dddddd',
    borderRadius: 75,
    alignSelf: 'center',
  },

  name: {
    marginTop: 10,
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },

  detailsSection: {
    width: '100%',
    marginTop: 20,
  },

  detailsTitle: {
    marginBottom: 8,
    color: '#000000',
    fontSize: 30,
    fontWeight: 'bold',
  },

  infoItem: {
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dddddd',
  },

  infoLabel: {
    color: '#222222',
    fontSize: 18,
    fontWeight: 'bold',
  },

  infoValue: {
    marginTop: 3,
    color: '#444444',
    fontSize: 18,
    lineHeight: 25,
  },

  locationSection: {
    width: '100%',
    marginTop: 12,
  },

  mapToggleButton: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapToggleText: {
    marginLeft: 5,
    color: '#1877f2',
    fontSize: 20,
    fontWeight: 'bold',
  },

  map: {
    width: '100%',
    height: 250,
    marginTop: 8,
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden',
  },

  noLocationContainer: {
    marginTop: 18,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noLocationText: {
    marginLeft: 5,
    color: '#808080',
    fontSize: 16,
  },

  createPostButton: {
    width: '100%',
    minHeight: 48,
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1877f2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createPostButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});