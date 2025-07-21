// src/firebase.js
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import app from "./config";

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
