import { getApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBRhN8vEG-fzkCPROHf0wVjViktzBbWmy0',
  authDomain: 'birdlens-7c3ad.firebaseapp.com',
  projectId: 'birdlens-7c3ad',
  storageBucket: 'birdlens-7c3ad.appspot.com',
  messagingSenderId: '841918647984',
  appId: '1:841918647984:web:6f7bf7f111f9082f8ab575',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function registerUser(firstName: string, lastName: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
  await setDoc(doc(db, 'users', credential.user.uid), {
    user_id: credential.user.uid,
    f_name: firstName.trim(),
    l_name: lastName.trim(),
    email: email.trim(),
    image: '',
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function loginUser(email: string, password: string) {
  return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getProfile(userId: string) {
  const snapshot = await getDoc(doc(db, 'users', userId));
  return snapshot.exists() ? snapshot.data() : null;
}

export function watchPosts(onChange: (posts: Array<Record<string, unknown>>) => void) {
  const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(30));
  return onSnapshot(postsQuery, snapshot => onChange(snapshot.docs.map(item => ({ id: item.id, ...item.data() }))));
}

export async function createPost(message: string, imageUri?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to post.');
  let image = '';
  if (imageUri) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    image = await getDownloadURL(imageRef);
  }
  return addDoc(collection(db, 'posts'), {
    message: message.trim(),
    image,
    author_name: user.displayName || user.email || 'BirdLens member',
    author_id: user.uid,
    timestamp: serverTimestamp(),
    likeCount: 0,
    commentCount: 0,
  });
}

export async function saveRating(rating: number) {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to rate BirdLens.');
  await setDoc(doc(db, 'users', user.uid), { rating }, { merge: true });
}
