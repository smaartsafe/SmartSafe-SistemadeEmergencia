import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "app-react-native-853b9.firebaseapp.com",
    databaseURL: import.meta.env.VITE_DATABASE_URL,
    projectId: "app-react-native-853b9",
    storageBucket: "app-react-native-853b9.appspot.com",
    messagingSenderId: "596018882387",
    appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
