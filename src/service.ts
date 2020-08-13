import * as firebase from 'firebase-admin';
import {Status, ThankYou} from './types';

const COLLECTION_THANKS = `x-tribute-thanks${process.env.IS_PROD === 'true' ? '' : '-dev'}`;
const COLLECTION_REVIEWER = `x-tribute-reviewers${process.env.IS_PROD === 'true' ? '' : '-dev'}`;
const COLLECTION_NO_REMINDER = `x-tribute-no-reminder${process.env.IS_PROD === 'true' ? '' : '-dev'}`;
const COLLECTION_STATISTICS = `x-tribute-statistics${process.env.IS_PROD === 'true' ? '' : '-dev'}`;

const app = firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const db = app.firestore();

export const setMessage = async (thankYou: ThankYou) => {
  const doc = await db.collection(COLLECTION_THANKS).add({...thankYou, createdAt: new Date()});
  return {
    id: doc.id,
    ...(await doc.get()).data()
  } as ThankYou;
};

export const getMessage = async (id: string) => ({
  id,
  ...(await db.collection(COLLECTION_THANKS).doc(id).get()).data()
});

export const getMessages = async () =>
  (await db.collection(COLLECTION_THANKS).get()).docs.map(d => ({
    id: d.id,
    ...d.data(),
  } as ThankYou));

export const getMessagesByAuthor = async (author: string) =>
  (await db.collection(COLLECTION_THANKS)
    .where('author.username', '==', author)
    .get()).docs.map(d => ({id: d.id, ...d.data()} as ThankYou));

export const getMessagesByRecipient = async (author: string) =>
  (await db.collection(COLLECTION_THANKS)
    .where('recipient.username', '==', author)
    .get()).docs.map(d => ({id: d.id, ...d.data()} as ThankYou));

export const updateMessage = async (id: string, thankYou: ThankYou) => {
  if (process.env.IS_PROD === 'true') {
    return await db.collection(COLLECTION_THANKS).doc(id).set(thankYou);
  }
};

export const isUsernameInReviewerCollection = async (username) =>
  (await db.collection(COLLECTION_REVIEWER).doc(username).get()).exists;

export const getReviewers = async () =>
  (await db.collection(COLLECTION_REVIEWER).get()).docs.map(d => d.id);

export const getApprovedMessages = async () =>
  (await db.collection(COLLECTION_THANKS).where('status', '==', Status.APPROVED).get())
    .docs.map(d => ({id: d.id, ...d.data()} as ThankYou));

export const getUnwantedReminderUsers = async (): Promise<string[]> =>
  (await db.collection(COLLECTION_NO_REMINDER).get()).docs.map(d => d.id);

export const setUnwantedReminderUser = async (id: string, username: string) =>
  await db.collection(COLLECTION_NO_REMINDER).doc(id).set({username});

export const incrementStatistic = async (id: string, key: string, n: number = 1) => {
  const statistic = {};
  statistic[key] = firebase.firestore.FieldValue.increment(n);
  return await db.collection(COLLECTION_STATISTICS).doc(id).set(statistic, {merge: true});
};

export const aggregateStatistic = async (id: string, key: string, element: string) => {
  const statistic = {};
  statistic[key] = firebase.firestore.FieldValue.arrayUnion(element);
  return await db.collection(COLLECTION_STATISTICS).doc(id).set(statistic, {merge: true});
};

export const getStatistics = async (period: string) =>
  (await db.collection(COLLECTION_STATISTICS).doc(period).get()).data();
