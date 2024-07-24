//NOUVELLE VERSION DE FIREBASE SUR GREGORY.HISSIGER@MY-LUCY.COM
/*
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8MX9USh7XKg3XZwANkOWsb94TM-tWRMQ",
  authDomain: "lucy-b4f20-2.firebaseapp.com",
  projectId: "lucy-b4f20-2",
  storageBucket: "lucy-b4f20-2.appspot.com",
  messagingSenderId: "548535035681",
  appId: "1:548535035681:web:5d3b80afeb8a3bd324c060"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
*/


import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseConfig;

if (process.env.REACT_APP_NODE_ENV === 'development') {
  firebaseConfig = require('./firebaseConfig.dev').firebaseConfig;

} else if (process.env.REACT_APP_NODE_ENV === 'preprod') {
  firebaseConfig = require('./firebaseConfig.preprod').firebaseConfig;

} else if (process.env.REACT_APP_NODE_ENV === 'production') {
  firebaseConfig = require('./firebaseConfig.prod').firebaseConfig;
  
} else {
  throw new Error('No Firebase configuration found for the current environment');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

