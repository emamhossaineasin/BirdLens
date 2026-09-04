import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from '@react-native-firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { Rating } from 'react-native-ratings';
import YoutubePlayer from 'react-native-youtube-iframe';

import { db } from '../services/firebase';
import type { AboutUsScreenProps } from '../types/navigation';

type RatingDocument = {
  rating?: number;
};

const MAX_RATING = 5;
const screenWidth = Dimensions.get('window').width;

export default function AboutUs({
  navigation,
}: AboutUsScreenProps): React.JSX.Element {
  const [rating, setRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchAverageRating = useCallback(async (): Promise<void> => {
    const ratingsSnapshot = await getDocs(collection(db, 'ratings'));

    let totalRating = 0;
    let ratingCount = 0;

    ratingsSnapshot.forEach(userDocument => {
      const data = userDocument.data() as RatingDocument;

      if (
        typeof data.rating === 'number' &&
        Number.isFinite(data.rating) &&
        data.rating >= 1 &&
        data.rating <= MAX_RATING
      ) {
        totalRating += data.rating;
        ratingCount += 1;
      }
    });

    const calculatedAverage =
      ratingCount > 0 ? totalRating / ratingCount : 0;

    setAverageRating(calculatedAverage);
  }, []);

  const fetchPreviousRating = useCallback(async (): Promise<void> => {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      return;
    }

    const ratingSnapshot = await getDoc(
      doc(db, 'ratings', currentUser.uid),
    );
    const data = ratingSnapshot.exists()
      ? (ratingSnapshot.data() as RatingDocument)
      : (await getDoc(doc(db, 'users', currentUser.uid))).data() as RatingDocument | undefined;

    if (
      typeof data?.rating === 'number' &&
      data.rating >= 1 &&
      data.rating <= MAX_RATING
    ) {
      setRating(data.rating);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadRatingData = async (): Promise<void> => {
      try {
        await Promise.all([
          fetchAverageRating(),
          fetchPreviousRating(),
        ]);
      } catch (error: unknown) {
        console.error('Error loading rating data:', error);

        if (active) {
          Alert.alert(
            'Unable to load ratings',
            'Rating information could not be loaded.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRatingData();

    return () => {
      active = false;
    };
  }, [fetchAverageRating, fetchPreviousRating]);

  const handleRating = (ratingValue: number): void => {
    setRating(ratingValue);
  };

  const handleSaveRating = async (): Promise<void> => {
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      Alert.alert(
        'Authentication required',
        'Please log in before submitting a rating.',
      );
      return;
    }

    if (rating < 1 || rating > MAX_RATING) {
      Alert.alert(
        'Select a rating',
        'Please select a rating between one and five.',
      );
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, 'ratings', currentUser.uid),
        {rating},
        {merge: true},
      );

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {rating},
        {merge: true},
      );

      await fetchAverageRating();

      Alert.alert(
        'Rating submitted',
        'Your rating was submitted successfully.',
      );
    } catch (error: unknown) {
      console.error('Error saving rating:', error);

      Alert.alert(
        'Rating failed',
        'Your rating could not be saved.',
      );
    } finally {
      setSaving(false);
    }
  };

  const normalizedRating = useMemo<number>(() => {
    return Math.min(
      1,
      Math.max(0, averageRating / MAX_RATING),
    );
  }, [averageRating]);

  const progressPercentage = normalizedRating * 100;

  const chartData = useMemo(
    () => ({
      labels: ['Rating'],
      data: [normalizedRating],
    }),
    [normalizedRating],
  );

  const chartConfig = {
    backgroundGradientFrom: '#696969',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#808080',
    backgroundGradientToOpacity: 0.5,

    color: (opacity = 1): string =>
      `rgba(30, 144, 255, ${opacity})`,

    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.appName}>BirdLens</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileLink}>Profile</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#1877f2"
          />

          <Text style={styles.loadingText}>
            Loading ratings...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={250}
              width={screenWidth}
              videoId="G-rsmbK7gdY"
              play={false}
            />
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>
              Rate this App
            </Text>

            <Rating
              type="star"
              ratingCount={MAX_RATING}
              imageSize={40}
              startingValue={rating}
              onFinishRating={handleRating}
              style={styles.ratingControl}
            />

            <Text style={styles.selectedRating}>
              Selected rating: {rating.toFixed(0)} / {MAX_RATING}
            </Text>

            <TouchableOpacity
              disabled={saving || rating === 0}
              onPress={() => {
                void handleSaveRating();
              }}
              style={[
                styles.ratingButton,
                (saving || rating === 0) &&
                  styles.disabledButton,
              ]}>
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                />
              ) : (
                <Text style={styles.buttonText}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.averageRating}>
              Average Rating: {averageRating.toFixed(2)} / 5
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <ProgressChart
              data={chartData}
              width={screenWidth - 20}
              height={220}
              strokeWidth={30}
              radius={80}
              chartConfig={chartConfig}
              hideLegend
            />

            <Text style={styles.percentageText}>
              {progressPercentage.toFixed(2)}% positive rating
            </Text>
          </View>
        </ScrollView>
      )}
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
    padding: 10,
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
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: 'gray',
    fontSize: 17,
    marginTop: 10,
  },
  scrollContent: {
    backgroundColor: 'white',
    paddingBottom: 30,
  },
  videoContainer: {
    backgroundColor: 'black',
    overflow: 'hidden',
    width: '100%',
  },
  ratingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  ratingTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  ratingControl: {
    paddingVertical: 10,
  },
  selectedRating: {
    color: '#444',
    fontSize: 17,
    marginTop: 5,
  },
  ratingButton: {
    alignItems: 'center',
    backgroundColor: '#1877f2',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 45,
    paddingHorizontal: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  averageRating: {
    fontSize: 22,
    marginTop: 18,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
});