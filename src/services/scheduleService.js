import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocumentsWhereOrdered,
  updateDocument,
} from './firestoreHelpers.js';

const COLLECTION = 'schedules';

export function createSchedule(scheduleData) {
  return createDocument(COLLECTION, {
    tukangUid: scheduleData.tukangUid,
    day: scheduleData.day || '',
    startTime: scheduleData.startTime || '',
    endTime: scheduleData.endTime || '',
    availableStatus: scheduleData.availableStatus ?? true,
  });
}

export function getSchedule(id) {
  return getDocument(COLLECTION, id);
}

export function getSchedulesByTukang(tukangUid) {
  return getDocumentsWhereOrdered(COLLECTION, 'tukangUid', '==', tukangUid, 'day', 'asc');
}

export function updateSchedule(id, scheduleData) {
  return updateDocument(COLLECTION, id, scheduleData);
}

export function deleteSchedule(id) {
  return deleteDocument(COLLECTION, id);
}
