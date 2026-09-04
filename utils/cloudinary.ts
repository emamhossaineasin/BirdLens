import axios from 'axios';

const CLOUD_NAME = 'dw5vnzqyw';
const UPLOAD_PRESET = 'BirdLens';

type CloudinaryResponse = {
  secure_url?: string;
  url?: string;
};

function getImageType(uri: string): string {
  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase();

  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

export async function uploadImageToCloudinary(
  uri: string,
  name = `birdlens-${Date.now()}.jpg`,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: getImageType(uri),
    name,
  } as unknown as Blob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await axios.post<CloudinaryResponse>(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: false,
    },
  );

  const imageUrl = response.data.secure_url ?? response.data.url;

  if (!imageUrl) {
    throw new Error('Cloudinary did not return an image URL.');
  }

  return imageUrl;
}
