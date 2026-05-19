import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig.js';

const AuthContext = createContext(null);
const allowedRegisterRoles = ['customer', 'tukang'];

function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/invalid-credential': 'Email atau password tidak sesuai.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/network-request-failed': 'Koneksi bermasalah. Coba lagi nanti.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    'auth/user-not-found': 'Akun tidak ditemukan.',
    'auth/weak-password': 'Password minimal harus 6 karakter.',
    'auth/wrong-password': 'Email atau password tidak sesuai.',
  };

  if (error?.code) {
    return messages[error.code] || error.message || 'Terjadi kesalahan autentikasi.';
  }

  return error?.message || 'Terjadi kesalahan autentikasi.';
}

async function getUserData(uid) {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserData(null);
      setRole(null);

      try {
        if (user) {
          const profile = await getUserData(user.uid);
          setUserData(profile);
          setRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Gagal membaca data pengguna:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function register({ name, email, password, phone, address, role: selectedRole }) {
    try {
      if (!allowedRegisterRoles.includes(selectedRole)) {
        throw new Error('Role pendaftaran hanya boleh customer atau tukang.');
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = credential;
      const profile = {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phone: phone.trim(),
        address: address.trim(),
        role: selectedRole,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateProfile(user, {
        displayName: profile.name,
        photoURL: profile.photoURL || null,
      });
      await setDoc(doc(db, 'users', user.uid), profile);

      setCurrentUser(user);
      setUserData(profile);
      setRole(profile.role);

      return { user, userData: profile };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function login(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserData(credential.user.uid);

      if (!profile) {
        throw new Error('Data pengguna tidak ditemukan di Firestore.');
      }

      setCurrentUser(credential.user);
      setUserData(profile);
      setRole(profile.role || null);

      return { user: credential.user, userData: profile };
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setRole(null);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  const value = useMemo(
    () => ({
      currentUser,
      userData,
      loading,
      role,
      isAuthenticated: Boolean(currentUser),
      register,
      login,
      logout,
      resetPassword,
    }),
    [currentUser, userData, loading, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
}
