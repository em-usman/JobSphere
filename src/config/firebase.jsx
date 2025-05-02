import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, orderBy,  query, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiABT1CoIn_1wyHx4w5Qq2mQMGxuh-olY",
  authDomain: "jobsphere-45fb3.firebaseapp.com",
  projectId: "jobsphere-45fb3",
  storageBucket: "jobsphere-45fb3.appspot.com",
  messagingSenderId: "925791989835",
  appId: "1:925791989835:web:c0ed8255cb163c1eaaddce",
  measurementId: "G-D3561GPFYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Create Google provider instance
export const googleProvider = new GoogleAuthProvider();

// Create a Firestore instance
export const db = getFirestore(app);
export { collection, addDoc, getDocs, orderBy, query, serverTimestamp, onSnapshot };

// Create a Storage instance and export storage-related functions
export const storage = getStorage(app);
export { ref, uploadBytesResumable, getDownloadURL };

// Set custom parameters to show all accounts
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


//used cloudinary to store images and videos
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'df3y6jl0q', // From Cloudinary dashboard
    apiKey: '344924393379357',       // From Cloudinary dashboard
    apiSecret: 'tnyd1694ct3eUGNXhsV-kqrxd7Q'  //⚠️ Never expose this in frontend code (use backend later)
  },
  url: {
    secure: true
  }
});

export { cld };

 export const cloudName = 'df3y6jl0q';
