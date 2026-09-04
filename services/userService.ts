import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  updateDoc,
} from '@react-native-firebase/firestore';

import type {UserProfile} from '../types/models';

export function subscribeToUser(
  userId: string,
  onUser: (profile: UserProfile | null) => void,
): () => void {
  const db = getFirestore();
  const reference = doc(db, 'users', userId);

  return onSnapshot(
    reference,
    snapshot => {
      if (!snapshot.exists()) {
        onUser(null);
        return;
      }

      onUser(snapshot.data() as UserProfile);
    },
    error => {
      console.error('User listener failed:', error);
      onUser(null);
    },
  );
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const db = getFirestore();
  const snapshot = await getDoc(doc(db, 'users', userId));

  return snapshot.exists()
    ? (snapshot.data() as UserProfile)
    : null;
}

export async function updateUserProfile(
  userId: string,
  changes: Partial<UserProfile>,
): Promise<void> {
  const db = getFirestore();
  await updateDoc(doc(db, 'users', userId), changes);
}