import {
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhereOrdered,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'bookings';
export const BOOKING_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
];

export function createBooking(bookingData) {
  const status = bookingData.status || 'pending';

  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error('Status booking tidak valid.');
  }

  return createDocument(COLLECTION, {
    customerUid: bookingData.customerUid,
    tukangUid: bookingData.tukangUid,
    serviceId: bookingData.serviceId,
    categoryId: bookingData.categoryId,
    customerName: bookingData.customerName || '',
    tukangName: bookingData.tukangName || '',
    bookingDate: bookingData.bookingDate || '',
    bookingTime: bookingData.bookingTime || '',
    address: bookingData.address || '',
    problemDescription: bookingData.problemDescription || '',
    status,
    totalPrice: Number(bookingData.totalPrice || 0),
  });
}

export function getBooking(id) {
  return getDocument(COLLECTION, id);
}

export function getBookings() {
  return getAllDocuments(COLLECTION);
}

export function getBookingsByCustomer(customerUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'customerUid', '==', customerUid);
}

export function getBookingsByTukang(tukangUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'tukangUid', '==', tukangUid);
}

export function getBookingsByStatus(status) {
  return getDocumentsWhereOrdered(COLLECTION, 'status', '==', status);
}

export function updateBooking(id, bookingData) {
  return updateDocument(COLLECTION, id, bookingData);
}

export function updateBookingStatus(id, status) {
  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error('Status booking tidak valid.');
  }

  return updateDocument(COLLECTION, id, { status });
}

export function deleteBooking(id) {
  return deleteDocument(COLLECTION, id);
}
