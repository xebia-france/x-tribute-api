import * as admin from 'firebase-admin';
import {ThankYou} from "./types";

const COLLECTION_THANKS = 'x-tribute-thanks';

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const db = app.firestore();

export const setMessage = async (thankYou: ThankYou) =>
  await db.collection(COLLECTION_THANKS).add(thankYou);

export const getMessages = async () =>
  (await db.collection(COLLECTION_THANKS).get()).docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

export const updateMessage = async (id: string, thankYou: ThankYou) =>
  await db.collection(COLLECTION_THANKS).doc(id).set(thankYou);
