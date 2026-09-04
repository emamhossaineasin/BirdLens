// import React from "react";
// import { Text, View } from "react-native";
// import { SearchScreenProps } from "../types/navigation";
// export default function Search({
//    navigation,
//  }: SearchScreenProps): React.JSX.Element {
//     return (
//         <View>
//             <Text>Search Screen</Text>
//         </View>
//     );
// }

import { toByteArray } from 'base64-js';
import jpeg from 'jpeg-js';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Loader from '../components/Loader';
import UploadModal from '../components/UploadModal';
import { BIRD_CLASSES, getBirdModel, getHighestScoreIndex } from '../services/classifier';
import type { SearchScreenProps } from '../types/navigation';
import {
  captureImage,
  type PickedImage,
  selectImageFromLibrary,
} from '../utils/imagePicker';

type ClassificationResult = {
  className: string;
  confidence: number;
};

function createModelInput(image: PickedImage): ArrayBuffer {
  if (image.type !== 'image/jpeg') {
    throw new Error('Only JPEG images are supported for classification.');
  }

  const decoded = jpeg.decode(toByteArray(image.base64), {useTArray: true});
  const input = new Float32Array(224 * 224 * 3);

  for (let y = 0; y < 224; y += 1) {
    for (let x = 0; x < 224; x += 1) {
      const sourceX = Math.min(decoded.width - 1, Math.floor((x * decoded.width) / 224));
      const sourceY = Math.min(decoded.height - 1, Math.floor((y * decoded.height) / 224));
      const sourceOffset = (sourceY * decoded.width + sourceX) * 4;
      const targetOffset = (y * 224 + x) * 3;

      input[targetOffset] = (decoded.data[sourceOffset] - 127.5) / 127.5;
      input[targetOffset + 1] = (decoded.data[sourceOffset + 1] - 127.5) / 127.5;
      input[targetOffset + 2] = (decoded.data[sourceOffset + 2] - 127.5) / 127.5;
    }
  }

  return input.buffer;
}

async function classifyImage(image: PickedImage): Promise<ClassificationResult | null> {
  const model = await getBirdModel();

  const outputs = await model.run([createModelInput(image)]);
  const probabilities = new Float32Array(outputs[0] ?? new ArrayBuffer(0));
  const highestIndex = getHighestScoreIndex(probabilities);

  return {
    className: BIRD_CLASSES[highestIndex] ?? 'Unknown bird',
    confidence: probabilities[highestIndex] ?? 0,
  };
}

export default function Search({
  navigation,
}: SearchScreenProps): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prediction, setPrediction] =
    useState<ClassificationResult | null>(null);
  const [classifying, setClassifying] = useState(false);

  const processImage = async (image: PickedImage): Promise<void> => {
    setImageUri(image.uri);
    setPrediction(null);

    try {
      setClassifying(true);
      const result = await classifyImage(image);

      if (result) {
        setPrediction(result);
      }
    } catch (error: unknown) {
      console.error('Classification failed:', error);
      Alert.alert(
        'Classification failed',
        'The selected image could not be classified.',
      );
    } finally {
      setClassifying(false);
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      const image = await selectImageFromLibrary();

      if (image) {
        await processImage(image);
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
      const image = await captureImage();

      if (image) {
        await processImage(image);
      }
    } catch (error: unknown) {
      console.error('Camera failed:', error);
      Alert.alert('Camera error', 'The camera could not be opened.');
    } finally {
      setModalVisible(false);
    }
  };

  const handleChangeImage = (): void => {
    setImageUri(null);
    setPrediction(null);
    setModalVisible(true);
  };

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

      <ScrollView contentContainerStyle={styles.content}>
        {prediction ? (
          <View style={styles.predictionBox}>
            <Text style={styles.prediction}>
              Prediction: {prediction.className}
            </Text>

            <Text style={styles.confidence}>
              Confidence: {(prediction.confidence * 100).toFixed(2)}%
            </Text>
          </View>
        ) : null}

        {classifying ? (
          <Loader text="Classifying image..." />
        ) : null}

        {imageUri ? (
          <Image
            source={{uri: imageUri}}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.emptyImage}>
            <Text style={styles.emptyImageText}>
              Choose or capture a bird image.
            </Text>
          </View>
        )}

        <TouchableOpacity
          disabled={classifying}
          onPress={
            imageUri
              ? handleChangeImage
              : () => setModalVisible(true)
          }
          style={[
            styles.button,
            classifying && styles.disabledButton,
          ]}>
          <Text style={styles.buttonText}>
            {imageUri ? 'Change Image' : 'Choose Image'}
          </Text>
        </TouchableOpacity>
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
    //backgroundColor: 'blue',
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
  content: {
    padding: 10,
  },
  predictionBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
  },
  prediction: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: 18,
    marginTop: 5,
  },
  image: {
    backgroundColor: 'white',
    height: 412,
    width: '100%',
  },
  emptyImage: {
    alignItems: 'center',
    backgroundColor: 'white',
    height: 300,
    justifyContent: 'center',
  },
  emptyImageText: {
    color: 'gray',
    fontSize: 18,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1877f2',
    borderRadius: 10,
    marginTop: 10,
    padding: 12,
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