// Firebase SDKs are loaded via <script> tags in each HTML page.
// This file just initializes the app with your config.
// All pages share this one file - no need to copy config anywhere else.

const firebaseConfig = {
  apiKey:            "AIzaSyADDlazgZ4Vnhp-qA_l2ho98lYS3onILc8",
  authDomain:        "surveypay-bd64b.firebaseapp.com",
  projectId:         "surveypay-bd64b",
  storageBucket:     "surveypay-bd64b.firebasestorage.app",
  messagingSenderId: "965049240238",
  appId:             "1:965049240238:web:2c99d342d0595faea63b3f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();