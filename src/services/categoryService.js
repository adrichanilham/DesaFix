import {
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'categories';

export function createCategory(categoryData) {
  return createDocument(COLLECTION, {
    name: categoryData.name || '',
    description: categoryData.description || '',
    iconURL: categoryData.iconURL || '',
  });
}

export function getCategory(id) {
  return getDocument(COLLECTION, id);
}

export function getCategories() {
  return getAllDocuments(COLLECTION);
}

export function updateCategory(id, categoryData) {
  return updateDocument(COLLECTION, id, categoryData);
}

export function deleteCategory(id) {
  return deleteDocument(COLLECTION, id);
}
