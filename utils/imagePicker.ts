import {
    launchCamera,
    launchImageLibrary,
    type CameraOptions,
    type ImageLibraryOptions,
} from 'react-native-image-picker';

const libraryOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 1,
  includeBase64: true,
  selectionLimit: 1,
};

const cameraOptions: CameraOptions = {
  mediaType: 'photo',
  quality: 1,
  includeBase64: true,
  cameraType: 'back',
  saveToPhotos: false,
};

export type PickedImage = {
  uri: string;
  base64: string;
  type?: string;
};

function getPickedImage(result: {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Array<{uri?: string; base64?: string; type?: string}>;
}): PickedImage | null {
  const asset = result.assets?.[0];

  if (!asset?.uri || !asset.base64) {
    return null;
  }

  return {uri: asset.uri, base64: asset.base64, type: asset.type ?? 'image/jpeg'};
}

export async function selectImageFromLibrary(): Promise<PickedImage | null> {
  const result = await launchImageLibrary(libraryOptions);

  if (result.didCancel) {
    return null;
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage ?? result.errorCode);
  }

  return getPickedImage(result);
}

export async function captureImage(): Promise<PickedImage | null> {
  const result = await launchCamera(cameraOptions);

  if (result.didCancel) {
    return null;
  }

  if (result.errorCode) {
    throw new Error(result.errorMessage ?? result.errorCode);
  }

  return getPickedImage(result);
}