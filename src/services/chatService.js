import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';
import {
  createDocumentWithCreatedAt,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhereOrdered,
  updateDocumentRaw,
} from './firestoreHelpers.js';

const COLLECTION = 'chats';

function sortMessagesByCreatedAt(messages) {
  return [...messages].sort((firstMessage, secondMessage) => {
    const firstCreatedAt = firstMessage.createdAt?.toMillis?.() || 0;
    const secondCreatedAt = secondMessage.createdAt?.toMillis?.() || 0;

    return firstCreatedAt - secondCreatedAt;
  });
}

export function createChatMessage(chatData) {
  return createDocumentWithCreatedAt(COLLECTION, {
    bookingId: chatData.bookingId,
    senderUid: chatData.senderUid,
    receiverUid: chatData.receiverUid,
    message: chatData.message || '',
    imageURL: chatData.imageURL || '',
    readStatus: chatData.readStatus ?? false,
  });
}

export function getChatMessage(id) {
  return getDocument(COLLECTION, id);
}

export function getChatMessages() {
  return getAllDocuments(COLLECTION);
}

export function getChatMessagesByBooking(bookingId) {
  return getDocumentsWhereOrdered(COLLECTION, 'bookingId', '==', bookingId, 'createdAt', 'asc');
}

export function subscribeChatMessagesByBooking(bookingId, callback, onError) {
  const q = query(collection(db, COLLECTION), where('bookingId', '==', bookingId));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));

      callback(
        sortMessagesByCreatedAt(messages),
      );
    },
    onError,
  );
}

export function getUnreadMessages(receiverUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'receiverUid', '==', receiverUid, 'createdAt', 'desc').then(
    (messages) => messages.filter((message) => !message.readStatus),
  );
}

export function updateChatMessage(id, chatData) {
  return updateDocumentRaw(COLLECTION, id, chatData);
}

export function markChatMessageAsRead(id) {
  return updateDocumentRaw(COLLECTION, id, { readStatus: true });
}

export function deleteChatMessage(id) {
  return deleteDocument(COLLECTION, id);
}
