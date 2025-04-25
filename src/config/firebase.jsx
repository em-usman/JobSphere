// config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

// Set custom parameters to show all accounts
googleProvider.setCustomParameters({
  prompt: 'select_account'
});