import {
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhere,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'services';

export function createService(serviceData) {
  return createDocument(COLLECTION, {
    tukangUid: serviceData.tukangUid,
    categoryId: serviceData.categoryId,
    name: serviceData.name || '',
    description: serviceData.description || '',
    price: Number(serviceData.price || 0),
  });
}

export function getService(id) {
  return getDocument(COLLECTION, id);
}

export function getServices() {
  return getAllDocuments(COLLECTION);
}

export function getServicesByTukang(tukangUid) {
  return getDocumentsWhere(COLLECTION, 'tukangUid', '==', tukangUid);
}

export function getServicesByCategory(categoryId) {
  return getDocumentsWhere(COLLECTION, 'categoryId', '==', categoryId);
}

export function updateService(id, serviceData) {
  return updateDocument(COLLECTION, id, serviceData);
}

export function deleteService(id) {
  return deleteDocument(COLLECTION, id);
}
