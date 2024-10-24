// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC7mgC2A3MGNpnlsa5ABjgmDQ4WxrpQBIo",
    authDomain: "niraama-be891.firebaseapp.com",
    projectId: "niraama-be891",
    storageBucket: "niraama-be891.appspot.com",
    messagingSenderId: "903517721874",
    appId: "1:903517721874:web:50d642f5368db540210fcb",
    measurementId: "G-C7QGPRPFVN"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

