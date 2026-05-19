import {
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhere,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'tukangProfiles';

export function createTukangProfile(profileData) {
  return createDocument(COLLECTION, {
    uid: profileData.uid,
    name: profileData.name || '',
    phone: profileData.phone || '',
    address: profileData.address || '',
    categoryId: profileData.categoryId || '',
    skill: profileData.skill || '',
    description: profileData.description || '',
    experience: profileData.experience || '',
    serviceArea: profileData.serviceArea || '',
    priceEstimation: profileData.priceEstimation || '',
    photoURL: profileData.photoURL || '',
    verificationStatus: profileData.verificationStatus || 'pending',
    activeStatus: profileData.activeStatus ?? false,
    ratingAverage: profileData.ratingAverage || 0,
    totalReviews: profileData.totalReviews || 0,
  });
}

export function getTukangProfile(id) {
  return getDocument(COLLECTION, id);
}

export async function getTukangProfileByUid(uid) {
  const profiles = await getDocumentsWhere(COLLECTION, 'uid', '==', uid);
  return profiles[0] || null;
}

export function getTukangProfiles() {
  return getAllDocuments(COLLECTION);
}

export function getActiveTukangProfiles() {
  return getDocumentsWhere(COLLECTION, 'activeStatus', '==', true);
}

export async function getAvailableTukangProfiles() {
  const profiles = await getActiveTukangProfiles();
  return profiles.filter((profile) => profile.verificationStatus === 'verified');
}

export function getTukangProfilesByCategory(categoryId) {
  return getDocumentsWhere(COLLECTION, 'categoryId', '==', categoryId);
}

export function updateTukangProfile(id, profileData) {
  return updateDocument(COLLECTION, id, profileData);
}

export function updateTukangVerificationStatus(id, verificationStatus) {
  return updateDocument(COLLECTION, id, { verificationStatus });
}

export function verifyTukangProfile(id) {
  return updateDocument(COLLECTION, id, {
    verificationStatus: 'verified',
    activeStatus: true,
  });
}

export function rejectTukangProfile(id) {
  return updateDocument(COLLECTION, id, {
    verificationStatus: 'rejected',
    activeStatus: false,
  });
}

export function updateTukangActiveStatus(id, activeStatus) {
  return updateDocument(COLLECTION, id, { activeStatus });
}

export function deleteTukangProfile(id) {
  return deleteDocument(COLLECTION, id);
}
