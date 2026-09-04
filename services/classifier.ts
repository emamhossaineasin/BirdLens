import { loadTensorflowModel, type TfliteModel } from 'react-native-fast-tflite';

export const BIRD_CLASSES = [
  'Asian Koel (Kokil)',
  'Black Drongo (Kalo Finge)',
  'Black-Winged Kite (Chil)',
  'Common Myna (Shalik)',
  'Common Tailorbird (Tuntuni)',
  'Coppersmith Barbet (Basanta Bouri)',
  'Heron (Bok)',
  'House Crow (Kak)',
  'Indian Roller (Neelkanth)',
  'Kingfisher (Machranga)',
  'Little Cormorant (Pankouri)',
  'Oriental Magpie Robin (Doel)',
  'Owl (Pecha)',
  'Parrot (Tiya)',
  'Red Vented Bulbul (Bulbuli)',
  'Red Wattled Lapwing (Lal Latika Hottiti)',
  'White Breasted Waterhen (Dahuk)',
  'White Rumped Shama (Shama)',
] as const;

let cachedModel: TfliteModel | null = null;

export async function getBirdModel(): Promise<TfliteModel> {
  if (cachedModel) {
    return cachedModel;
  }

  try {
    cachedModel = await loadTensorflowModel(
      require('../assets/models/birdlens.tflite'),
      [],
    );
  } catch (error) {
    throw new Error(
      'Missing TensorFlow Lite model. Convert your trained bird model to assets/models/birdlens.tflite and rebuild the app.',
      { cause: error },
    );
  }

  return cachedModel;
}

export function getHighestScoreIndex(scores: Float32Array): number {
  if (scores.length === 0) {
    throw new Error('The model returned no classification scores.');
  }

  let highestIndex = 0;

  for (let index = 1; index < scores.length; index += 1) {
    if (scores[index] > scores[highestIndex]) {
      highestIndex = index;
    }
  }

  return highestIndex;
}