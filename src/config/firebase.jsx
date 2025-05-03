// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, 
  orderBy, query, serverTimestamp, onSnapshot 
} from "firebase/firestore";
import { 
  getStorage, ref, uploadBytesResumable, getDownloadURL 
} from "firebase/storage";

// Firebase project configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBiABT1CoIn_1wyHx4w5Qq2mQMGxuh-olY",
  authDomain: "jobsphere-45fb3.firebaseapp.com",
  projectId: "jobsphere-45fb3",
  storageBucket: "jobsphere-45fb3.appspot.com",
  messagingSenderId: "925791989835",
  appId: "1:925791989835:web:c0ed8255cb163c1eaaddce",
  measurementId: "G-D3561GPFYL"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);


// Get Firebase Auth instance
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Customize Google sign-in to prompt account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Get Firestore instance
export const db = getFirestore(app);

// Export Firestore utilities for use in other files
export { 
  collection,     // For accessing Firestore collections
  addDoc,         // For adding new documents
  getDocs,        // For reading documents
  orderBy,        // For ordering queries
  query,          // For querying collections
  serverTimestamp,// For adding a timestamp to documents
  onSnapshot,     // For real-time updates
  doc,            // For referencing specific documents
  updateDoc       // For updating document data
};


// Get Firebase Storage instance
export const storage = getStorage(app);

// Export storage utilities
export { 
  ref,                  // For referencing storage paths
  uploadBytesResumable, // For uploading files with progress
  getDownloadURL        // For getting file URLs
};

// ⚠️ Do NOT expose API secret in frontend (this should be done server-side in production)
import { Cloudinary } from '@cloudinary/url-gen';

// Create a Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: 'df3y6jl0q',              // Replace with your actual cloud name
    apiKey: '344924393379357',          // Replace with your actual API key
    apiSecret: 'tnyd1694ct3eUGNXhsV-kqrxd7Q' // ⚠️ SECURITY WARNING: Do NOT expose in frontend
  },
  url: {
    secure: true                         // Ensures HTTPS URLs
  }
});

// Export Cloudinary instance and name
export { cld };
export const cloudName = 'df3y6jl0q';

