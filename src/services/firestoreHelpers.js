import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';

export function withCreateTimestamps(data) {
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function withCreatedTimestamp(data) {
  return {
    ...data,
    createdAt: serverTimestamp(),
  };
}

export function withUpdateTimestamp(data) {
  return {
    ...data,
    updatedAt: serverTimestamp(),
  };
}

export function mapSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function getSortableValue(value) {
  if (value?.toMillis) {
    return value.toMillis();
  }

  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  return value ?? '';
}

function sortDocuments(documents, field, direction = 'desc') {
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...documents].sort((firstDocument, secondDocument) => {
    const firstValue = getSortableValue(firstDocument[field]);
    const secondValue = getSortableValue(secondDocument[field]);

    if (firstValue < secondValue) {
      return -1 * multiplier;
    }

    if (firstValue > secondValue) {
      return 1 * multiplier;
    }

    return 0;
  });
}

export async function createDocument(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), withCreateTimestamps(data));
  await updateDoc(ref, { id: ref.id });
  return { id: ref.id, ...data };
}

export async function createDocumentWithCreatedAt(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), withCreatedTimestamp(data));
  await updateDoc(ref, { id: ref.id });
  return { id: ref.id, ...data };
}

export async function setDocument(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), withCreateTimestamps({ id, ...data }));
  return { id, ...data };
}

export async function getDocument(collectionName, id) {
  const snapshot = await getDoc(doc(db, collectionName, id));
  return snapshot.exists() ? mapSnapshot(snapshot) : null;
}

export async function getAllDocuments(collectionName, orderField = 'createdAt') {
  const q = query(collection(db, collectionName), orderBy(orderField, 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapSnapshot);
}

export async function updateDocument(collectionName, id, data) {
  await updateDoc(doc(db, collectionName, id), withUpdateTimestamp(data));
  return { id, ...data };
}

export async function updateDocumentRaw(collectionName, id, data) {
  await updateDoc(doc(db, collectionName, id), data);
  return { id, ...data };
}

export async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
  return id;
}

export async function getDocumentsWhere(collectionName, field, operator, value) {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapSnapshot);
}

export async function getDocumentsWhereOrdered(
  collectionName,
  field,
  operator,
  value,
  orderField = 'createdAt',
  direction = 'desc',
) {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snapshot = await getDocs(q);
  return sortDocuments(snapshot.docs.map(mapSnapshot), orderField, direction);
}
