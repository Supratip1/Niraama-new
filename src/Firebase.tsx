// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7mgC2A3MGNpnlsa5ABjgmDQ4WxrpQBIo",
  authDomain: "niraama-be891.firebaseapp.com",
  projectId: "niraama-be891",
  storageBucket: "niraama-be891.appspot.com",
  messagingSenderId: "903517721874",
  appId: "1:903517721874:web:50d642f5368db540210fcb",
  measurementId: "G-C7QGPRPFVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);