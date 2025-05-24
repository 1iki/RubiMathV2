import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGNWf-N4TfXcxxiZVl7z0ShDQDeWdRqdY",
  authDomain: "mathfun-942d0.firebaseapp.com",
  projectId: "mathfun-942d0",
  storageBucket: "mathfun-942d0.firebasestorage.app",
  messagingSenderId: "430167775073",
  appId: "1:430167775073:web:f50ca2956d380790edd720",
  measurementId: "G-K56WZ762ZM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
