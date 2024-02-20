import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
//import 'dotenv/config';

const firebaseConfig = {
  apiKey: "AIzaSyBRhN8vEG-fzkCPROHf0wVjViktzBbWmy0",
  authDomain: "birdlens-7c3ad.firebaseapp.com",
  projectId: "birdlens-7c3ad",
  storageBucket: "birdlens-7c3ad.appspot.com",
  messagingSenderId: "841918647984",
  appId: "1:841918647984:web:6f7bf7f111f9082f8ab575",
  measurementId: "G-YJ0WN74CS1"
};

export default app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();