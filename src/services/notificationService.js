import {
  createDocumentWithCreatedAt,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhereOrdered,
  updateDocumentRaw,
} from './firestoreHelpers.js';

const COLLECTION = 'notifications';

export function createNotification(notificationData) {
  return createDocumentWithCreatedAt(COLLECTION, {
    receiverUid: notificationData.receiverUid,
    title: notificationData.title || '',
    message: notificationData.message || '',
    type: notificationData.type || 'info',
    readStatus: notificationData.readStatus ?? false,
  });
}

export function getNotification(id) {
  return getDocument(COLLECTION, id);
}

export function getNotifications() {
  return getAllDocuments(COLLECTION);
}

export function getNotificationsByReceiver(receiverUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'receiverUid', '==', receiverUid);
}

export function getUserNotifications(receiverUid) {
  return getNotificationsByReceiver(receiverUid);
}

export function updateNotification(id, notificationData) {
  return updateDocumentRaw(COLLECTION, id, notificationData);
}

export function markNotificationAsRead(id) {
  return updateDocumentRaw(COLLECTION, id, { readStatus: true });
}

export async function markAllNotificationsAsRead(receiverUid) {
  const notifications = await getUserNotifications(receiverUid);
  const unreadNotifications = notifications.filter((notification) => !notification.readStatus);

  await Promise.all(
    unreadNotifications.map((notification) => markNotificationAsRead(notification.id)),
  );

  return unreadNotifications.length;
}

export function deleteNotification(id) {
  return deleteDocument(COLLECTION, id);
}
