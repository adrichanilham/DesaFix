import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig.js';

const timestamp = () => serverTimestamp();

const users = [
  {
    id: 'admin001',
    data: {
      uid: 'admin001',
      name: 'Admin DesaFix',
      email: 'admin@desafix.com',
      phone: '081234567001',
      address: 'Kantor DesaFix',
      role: 'admin',
      photoURL: '',
      activeStatus: true,
    },
  },
  {
    id: 'customer001',
    data: {
      uid: 'customer001',
      name: 'Budi Santoso',
      email: 'budi@gmail.com',
      phone: '081234567002',
      address: 'Desa Sungai Durian',
      role: 'customer',
      photoURL: '',
      activeStatus: true,
    },
  },
  {
    id: 'customer002',
    data: {
      uid: 'customer002',
      name: 'Siti Rahma',
      email: 'siti@gmail.com',
      phone: '081234567003',
      address: 'Desa Kampung Baru',
      role: 'customer',
      photoURL: '',
      activeStatus: true,
    },
  },
  {
    id: 'tukang001',
    data: {
      uid: 'tukang001',
      name: 'Pak Andi',
      email: 'andi@gmail.com',
      phone: '081234567004',
      address: 'Desa Sungai Durian',
      role: 'tukang',
      photoURL: '',
      activeStatus: true,
    },
  },
  {
    id: 'tukang002',
    data: {
      uid: 'tukang002',
      name: 'Pak Rudi',
      email: 'rudi@gmail.com',
      phone: '081234567005',
      address: 'Desa Kampung Baru',
      role: 'tukang',
      photoURL: '',
      activeStatus: true,
    },
  },
  {
    id: 'tukang003',
    data: {
      uid: 'tukang003',
      name: 'Pak Joko',
      email: 'joko@gmail.com',
      phone: '081234567006',
      address: 'Desa Lubuk Alung',
      role: 'tukang',
      photoURL: '',
      activeStatus: true,
    },
  },
];

const categories = [
  {
    id: 'cat_listrik',
    data: {
      id: 'cat_listrik',
      name: 'Tukang Listrik',
      description:
        'Layanan perbaikan instalasi listrik, lampu, stop kontak, dan gangguan listrik rumah.',
      iconURL: '',
    },
  },
  {
    id: 'cat_bangunan',
    data: {
      id: 'cat_bangunan',
      name: 'Tukang Bangunan',
      description:
        'Layanan renovasi rumah, perbaikan dinding, lantai, atap, dan pekerjaan bangunan lainnya.',
      iconURL: '',
    },
  },
  {
    id: 'cat_pompa',
    data: {
      id: 'cat_pompa',
      name: 'Servis Pompa Air',
      description:
        'Layanan perbaikan pompa air, pemasangan pompa, dan pengecekan saluran air.',
      iconURL: '',
    },
  },
  {
    id: 'cat_motor',
    data: {
      id: 'cat_motor',
      name: 'Servis Motor',
      description: 'Layanan servis ringan motor, ganti oli, cek mesin, dan perbaikan dasar.',
      iconURL: '',
    },
  },
  {
    id: 'cat_elektronik',
    data: {
      id: 'cat_elektronik',
      name: 'Servis Elektronik',
      description:
        'Layanan perbaikan TV, kipas angin, rice cooker, kulkas, dan alat elektronik rumah tangga.',
      iconURL: '',
    },
  },
];

const tukangProfiles = [
  {
    id: 'profile_tukang001',
    data: {
      id: 'profile_tukang001',
      uid: 'tukang001',
      name: 'Pak Andi',
      phone: '081234567004',
      address: 'Desa Sungai Durian',
      categoryId: 'cat_listrik',
      skill: 'Instalasi listrik rumah',
      description: 'Berpengalaman memperbaiki listrik rumah, lampu, saklar, dan stop kontak.',
      experience: '8 tahun',
      serviceArea: 'Desa Sungai Durian dan sekitarnya',
      priceEstimation: 75000,
      photoURL: '',
      verificationStatus: 'verified',
      activeStatus: true,
      ratingAverage: 4.8,
      totalReviews: 2,
    },
  },
  {
    id: 'profile_tukang002',
    data: {
      id: 'profile_tukang002',
      uid: 'tukang002',
      name: 'Pak Rudi',
      phone: '081234567005',
      address: 'Desa Kampung Baru',
      categoryId: 'cat_bangunan',
      skill: 'Renovasi dan perbaikan rumah',
      description: 'Mengerjakan renovasi kecil, perbaikan atap, dinding, dan lantai.',
      experience: '10 tahun',
      serviceArea: 'Desa Kampung Baru dan sekitarnya',
      priceEstimation: 150000,
      photoURL: '',
      verificationStatus: 'verified',
      activeStatus: true,
      ratingAverage: 4.6,
      totalReviews: 1,
    },
  },
  {
    id: 'profile_tukang003',
    data: {
      id: 'profile_tukang003',
      uid: 'tukang003',
      name: 'Pak Joko',
      phone: '081234567006',
      address: 'Desa Lubuk Alung',
      categoryId: 'cat_pompa',
      skill: 'Servis pompa air',
      description: 'Melayani perbaikan pompa air mati, pemasangan pompa, dan pengecekan pipa.',
      experience: '6 tahun',
      serviceArea: 'Desa Lubuk Alung dan sekitarnya',
      priceEstimation: 100000,
      photoURL: '',
      verificationStatus: 'pending',
      activeStatus: false,
      ratingAverage: 0,
      totalReviews: 0,
    },
  },
];

const services = [
  {
    id: 'service001',
    data: {
      id: 'service001',
      tukangUid: 'tukang001',
      categoryId: 'cat_listrik',
      name: 'Perbaikan Lampu dan Saklar',
      description: 'Memperbaiki lampu mati, saklar rusak, dan stop kontak bermasalah.',
      price: 75000,
    },
  },
  {
    id: 'service002',
    data: {
      id: 'service002',
      tukangUid: 'tukang001',
      categoryId: 'cat_listrik',
      name: 'Instalasi Listrik Rumah',
      description: 'Pemasangan jalur listrik sederhana untuk rumah.',
      price: 200000,
    },
  },
  {
    id: 'service003',
    data: {
      id: 'service003',
      tukangUid: 'tukang002',
      categoryId: 'cat_bangunan',
      name: 'Perbaikan Atap Bocor',
      description: 'Memperbaiki atap bocor dan mengganti bagian atap yang rusak.',
      price: 150000,
    },
  },
  {
    id: 'service004',
    data: {
      id: 'service004',
      tukangUid: 'tukang002',
      categoryId: 'cat_bangunan',
      name: 'Perbaikan Dinding Retak',
      description: 'Menambal dan memperbaiki dinding rumah yang retak.',
      price: 120000,
    },
  },
  {
    id: 'service005',
    data: {
      id: 'service005',
      tukangUid: 'tukang003',
      categoryId: 'cat_pompa',
      name: 'Servis Pompa Air Mati',
      description: 'Pemeriksaan dan perbaikan pompa air yang tidak menyala.',
      price: 100000,
    },
  },
];

const schedules = [
  {
    id: 'schedule001',
    data: {
      id: 'schedule001',
      tukangUid: 'tukang001',
      day: 'Senin',
      startTime: '08:00',
      endTime: '17:00',
      status: 'available',
      availableStatus: true,
    },
  },
  {
    id: 'schedule002',
    data: {
      id: 'schedule002',
      tukangUid: 'tukang001',
      day: 'Selasa',
      startTime: '08:00',
      endTime: '17:00',
      status: 'available',
      availableStatus: true,
    },
  },
  {
    id: 'schedule003',
    data: {
      id: 'schedule003',
      tukangUid: 'tukang002',
      day: 'Rabu',
      startTime: '09:00',
      endTime: '16:00',
      status: 'available',
      availableStatus: true,
    },
  },
  {
    id: 'schedule004',
    data: {
      id: 'schedule004',
      tukangUid: 'tukang003',
      day: 'Kamis',
      startTime: '08:00',
      endTime: '15:00',
      status: 'unavailable',
      availableStatus: false,
    },
  },
];

const bookings = [
  {
    id: 'booking001',
    data: {
      id: 'booking001',
      customerUid: 'customer001',
      tukangUid: 'tukang001',
      serviceId: 'service001',
      categoryId: 'cat_listrik',
      customerName: 'Budi Santoso',
      tukangName: 'Pak Andi',
      serviceName: 'Perbaikan Lampu dan Saklar',
      bookingDate: '2026-05-20',
      bookingTime: '09:00',
      address: 'Desa Sungai Durian',
      problemDescription: 'Lampu ruang tamu mati dan saklar terasa longgar.',
      status: 'completed',
      totalPrice: 75000,
    },
  },
  {
    id: 'booking002',
    data: {
      id: 'booking002',
      customerUid: 'customer002',
      tukangUid: 'tukang002',
      serviceId: 'service003',
      categoryId: 'cat_bangunan',
      customerName: 'Siti Rahma',
      tukangName: 'Pak Rudi',
      serviceName: 'Perbaikan Atap Bocor',
      bookingDate: '2026-05-21',
      bookingTime: '10:00',
      address: 'Desa Kampung Baru',
      problemDescription: 'Atap rumah bocor saat hujan.',
      status: 'in_progress',
      totalPrice: 150000,
    },
  },
  {
    id: 'booking003',
    data: {
      id: 'booking003',
      customerUid: 'customer001',
      tukangUid: 'tukang001',
      serviceId: 'service002',
      categoryId: 'cat_listrik',
      customerName: 'Budi Santoso',
      tukangName: 'Pak Andi',
      serviceName: 'Instalasi Listrik Rumah',
      bookingDate: '2026-05-22',
      bookingTime: '14:00',
      address: 'Desa Sungai Durian',
      problemDescription: 'Ingin menambah stop kontak di kamar.',
      status: 'accepted',
      totalPrice: 200000,
    },
  },
  {
    id: 'booking004',
    data: {
      id: 'booking004',
      customerUid: 'customer002',
      tukangUid: 'tukang003',
      serviceId: 'service005',
      categoryId: 'cat_pompa',
      customerName: 'Siti Rahma',
      tukangName: 'Pak Joko',
      serviceName: 'Servis Pompa Air Mati',
      bookingDate: '2026-05-23',
      bookingTime: '11:00',
      address: 'Desa Lubuk Alung',
      problemDescription: 'Pompa air tidak menyala sejak pagi.',
      status: 'pending',
      totalPrice: 100000,
    },
  },
];

const reviews = [
  {
    id: 'review001',
    data: {
      id: 'review001',
      bookingId: 'booking001',
      customerUid: 'customer001',
      tukangUid: 'tukang001',
      rating: 5,
      comment: 'Pelayanan cepat dan hasilnya bagus.',
    },
  },
  {
    id: 'review002',
    data: {
      id: 'review002',
      bookingId: 'booking001',
      customerUid: 'customer001',
      tukangUid: 'tukang001',
      rating: 4.6,
      comment: 'Tukangnya ramah dan menjelaskan kerusakan dengan jelas.',
    },
  },
];

const chats = [
  {
    id: 'chat001',
    data: {
      id: 'chat001',
      bookingId: 'booking003',
      senderUid: 'customer001',
      receiverUid: 'tukang001',
      message: 'Pak, besok bisa datang jam 2 siang?',
      imageURL: '',
      readStatus: true,
    },
  },
  {
    id: 'chat002',
    data: {
      id: 'chat002',
      bookingId: 'booking003',
      senderUid: 'tukang001',
      receiverUid: 'customer001',
      message: 'Bisa Pak, nanti saya datang sesuai jadwal.',
      imageURL: '',
      readStatus: false,
    },
  },
  {
    id: 'chat003',
    data: {
      id: 'chat003',
      bookingId: 'booking002',
      senderUid: 'customer002',
      receiverUid: 'tukang002',
      message: 'Pak, atap yang bocor ada di bagian dapur.',
      imageURL: '',
      readStatus: true,
    },
  },
];

const notifications = [
  {
    id: 'notif001',
    data: {
      id: 'notif001',
      receiverUid: 'tukang001',
      title: 'Pesanan Baru',
      message: 'Budi Santoso membuat pesanan instalasi listrik rumah.',
      type: 'booking',
      readStatus: false,
    },
  },
  {
    id: 'notif002',
    data: {
      id: 'notif002',
      receiverUid: 'customer001',
      title: 'Pesanan Diterima',
      message: 'Pak Andi menerima pesanan Anda.',
      type: 'booking',
      readStatus: false,
    },
  },
  {
    id: 'notif003',
    data: {
      id: 'notif003',
      receiverUid: 'tukang003',
      title: 'Menunggu Verifikasi',
      message: 'Profil Anda sedang menunggu verifikasi admin.',
      type: 'verification',
      readStatus: false,
    },
  },
];

function withFullTimestamps(data) {
  return {
    ...data,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };
}

function withCreatedAt(data) {
  return {
    ...data,
    createdAt: timestamp(),
  };
}

function writeCollection(collectionName, records, timestampMode = 'full') {
  return records.map((record) => {
    const data =
      timestampMode === 'createdOnly'
        ? withCreatedAt(record.data)
        : withFullTimestamps(record.data);

    return setDoc(doc(db, collectionName, record.id), data);
  });
}

export async function seedDummyData() {
  try {
    const writes = [
      ...writeCollection('users', users),
      ...writeCollection('categories', categories),
      ...writeCollection('tukangProfiles', tukangProfiles),
      ...writeCollection('services', services),
      ...writeCollection('bookings', bookings),
      ...writeCollection('reviews', reviews, 'createdOnly'),
      ...writeCollection('chats', chats, 'createdOnly'),
      ...writeCollection('notifications', notifications),
      ...writeCollection('schedules', schedules),
    ];

    await Promise.all(writes);
    console.log(`Seed dummy data DesaFix berhasil. Total dokumen: ${writes.length}`);
    return { success: true, totalDocuments: writes.length };
  } catch (error) {
    console.error('Seed dummy data DesaFix gagal:', error);
    throw error;
  }
}
