import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (typeof window !== "undefined") {
  throw new Error("firebase-admin cannot be imported on the client side.");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let app = null;
const apps = getApps();

if (apps.length === 0) {
  if (projectId && clientEmail && privateKey) {
    try {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.error("Failed to initialize Firebase Admin SDK:", err);
    }
  } else {
    console.warn("Firebase Admin SDK credentials are not configured in environment variables.");
  }
} else {
  app = getApp();
}

export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;
