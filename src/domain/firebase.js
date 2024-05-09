import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: import.meta.env.API_KEY,
    authDomain: "app-react-native-853b9.firebaseapp.com",
    databaseURL: import.meta.env.DATABASE_URL,
    projectId: "app-react-native-853b9",
    storageBucket: "app-react-native-853b9.appspot.com",
    messagingSenderId: "596018882387",
    appId: import.meta.env.APP_ID
};

const app = initializeApp(firebaseConfig);

export default app