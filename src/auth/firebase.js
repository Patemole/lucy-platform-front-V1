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

