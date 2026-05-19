import {
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhere,
  setDocument,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'users';

export function createUser(uid, userData) {
  return setDocument(COLLECTION, uid, {
    uid,
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.role || 'customer',
    photoURL: userData.photoURL || '',
  });
}

export function getUser(uid) {
  return getDocument(COLLECTION, uid);
}

export function getUsers() {
  return getAllDocuments(COLLECTION);
}

export function getUsersByRole(role) {
  return getDocumentsWhere(COLLECTION, 'role', '==', role);
}

export function updateUser(uid, userData) {
  return updateDocument(COLLECTION, uid, userData);
}

export function updateUserActiveStatus(uid, activeStatus) {
  return updateDocument(COLLECTION, uid, { activeStatus });
}

export function deleteUser(uid) {
  return deleteDocument(COLLECTION, uid);
}
