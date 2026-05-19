import {
  createDocumentWithCreatedAt,
  deleteDocument,
  getAllDocuments,
  getDocument,
  getDocumentsWhere,
  getDocumentsWhereOrdered,
  updateDocumentRaw,
} from './firestoreHelpers.js';
import { getBooking } from './bookingService.js';
import { getTukangProfileByUid, updateTukangProfile } from './tukangService.js';

const COLLECTION = 'reviews';

export function createReview(reviewData) {
  return createDocumentWithCreatedAt(COLLECTION, {
    bookingId: reviewData.bookingId,
    customerUid: reviewData.customerUid,
    tukangUid: reviewData.tukangUid,
    rating: Number(reviewData.rating || 0),
    comment: reviewData.comment || '',
  });
}

export function getReview(id) {
  return getDocument(COLLECTION, id);
}

export function getReviews() {
  return getAllDocuments(COLLECTION);
}

export function getReviewsByBooking(bookingId) {
  return getDocumentsWhereOrdered(COLLECTION, 'bookingId', '==', bookingId);
}

export async function getReviewByBookingAndCustomer(bookingId, customerUid) {
  const reviews = await getDocumentsWhere(COLLECTION, 'bookingId', '==', bookingId);
  return reviews.find((review) => review.customerUid === customerUid) || null;
}

export function getReviewsByTukang(tukangUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'tukangUid', '==', tukangUid);
}

export function getReviewsByCustomer(customerUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'customerUid', '==', customerUid);
}

export function updateReview(id, reviewData) {
  return updateDocumentRaw(COLLECTION, id, reviewData);
}

export function deleteReview(id) {
  return deleteDocument(COLLECTION, id);
}

export async function createReviewForCompletedBooking({ bookingId, customerUid, rating, comment }) {
  const booking = await getBooking(bookingId);

  if (!booking) {
    throw new Error('Booking tidak ditemukan.');
  }

  if (booking.customerUid !== customerUid) {
    throw new Error('Anda hanya boleh memberi ulasan pada booking milik sendiri.');
  }

  if (booking.status !== 'completed') {
    throw new Error('Ulasan hanya bisa diberikan untuk booking yang sudah selesai.');
  }

  const existingReview = await getReviewByBookingAndCustomer(bookingId, customerUid);
  if (existingReview) {
    throw new Error('Booking ini sudah diberi ulasan.');
  }

  const normalizedRating = Number(rating);
  if (normalizedRating < 1 || normalizedRating > 5) {
    throw new Error('Rating harus bernilai 1 sampai 5.');
  }

  const review = await createReview({
    bookingId,
    customerUid,
    tukangUid: booking.tukangUid,
    rating: normalizedRating,
    comment,
  });

  const tukangProfile = await getTukangProfileByUid(booking.tukangUid);
  if (tukangProfile) {
    const currentTotalReviews = Number(tukangProfile.totalReviews || 0);
    const currentAverage = Number(tukangProfile.ratingAverage || 0);
    const nextTotalReviews = currentTotalReviews + 1;
    const nextAverage =
      (currentAverage * currentTotalReviews + normalizedRating) / nextTotalReviews;

    await updateTukangProfile(tukangProfile.id, {
      ratingAverage: Number(nextAverage.toFixed(2)),
      totalReviews: nextTotalReviews,
    });
  }

  return review;
}
