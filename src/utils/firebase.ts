import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCeYlq4IVWpo5U0UjYM81PsTKtqvHl4Aro",
  authDomain: "chat-41a49.firebaseapp.com",
  projectId: "chat-41a49",
  messagingSenderId: "1062525663611",
  appId: "1:1062525663611:web:a5291a5caab0374122e5de",
  measurementId: "G-SWGNNSDYNX",
  databaseURL: "https://chat-41a49-default-rtdb.firebaseio.com",
  storageBucket: "chat-41a49.appspot.com",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
// Get a reference to the Firebase Storage service
export const storage = getStorage();
