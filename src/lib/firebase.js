import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { categoryToSlug } from "./storageCategories.js";

// ─── FIREBASE CONFIG ─────────────────────────────────────────────────────────
// Lee desde variables de entorno Vite (VITE_FIREBASE_*) con fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_demo_api_key_placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dorella-jewelry.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dorella-jewelry",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dorella-jewelry.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── AUTHENTICATION ──────────────────────────────────────────────────────────
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión con Firebase:", error);
    throw new Error(error.message || "Credenciales incorrectas", { cause: error });
  }
}

export async function signOut() {
  await fbSignOut(auth);
  localStorage.removeItem("dorella_admin_logged_in");
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function getSession() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? { user, email: user.email } : null);
    });
  });
}

// ─── PRODUCTS CRUD (FIRESTORE) ───────────────────────────────────────────────
export async function fetchProducts() {
  const colRef = collection(db, "products");
  const snapshot = await getDocs(colRef);
  const products = [];
  snapshot.forEach((docSnap) => {
    products.push({ id: docSnap.id, ...docSnap.data() });
  });
  return products;
}

export async function addProduct(productData) {
  const id = String(productData.id || `custom-${Date.now()}`);
  const docRef = doc(db, "products", id);
  const dataToSave = {
    ...productData,
    id,
    updated_at: new Date().toISOString(),
  };
  await setDoc(docRef, dataToSave);
  return dataToSave;
}

export async function updateProduct(id, fields) {
  const docRef = doc(db, "products", String(id));
  const cleanFields = { ...fields, updated_at: new Date().toISOString() };
  await updateDoc(docRef, cleanFields);
  return { id, ...cleanFields };
}

export async function deleteProduct(id) {
  const docRef = doc(db, "products", String(id));
  await deleteDoc(docRef);
  return true;
}

// ─── ORDERS CRUD (FIRESTORE) ─────────────────────────────────────────────────
export async function fetchOrders() {
  try {
    const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    return orders;
  } catch (_err) {
    // Fallback si aún no se ha creado el índice compuesto
    const colRef = collection(db, "orders");
    const snapshot = await getDocs(colRef);
    const orders = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    return orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
}

export async function saveOrder(orderData) {
  const id = String(orderData.id || `DJ-${Date.now()}`);
  const docRef = doc(db, "orders", id);
  const data = {
    ...orderData,
    id,
    created_at: orderData.created_at || new Date().toISOString(),
    status: orderData.status || "Pendiente",
  };
  await setDoc(docRef, data);
  return id;
}

export async function updateOrderStatus(id, status) {
  const docRef = doc(db, "orders", String(id));
  await updateDoc(docRef, { status, updated_at: new Date().toISOString() });
  return true;
}

export async function deleteOrder(id) {
  const docRef = doc(db, "orders", String(id));
  await deleteDoc(docRef);
  return true;
}

// ─── REVIEWS CRUD (FIRESTORE) ────────────────────────────────────────────────
export async function fetchReviews(productId) {
  try {
    const q = query(
      collection(db, "reviews"),
      where("product_id", "==", String(productId))
    );
    const snapshot = await getDocs(q);
    const reviews = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() });
    });
    return reviews.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } catch (err) {
    console.error("Error al cargar reseñas:", err);
    return [];
  }
}

export async function fetchAllReviews() {
  try {
    const q = query(collection(db, "reviews"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const reviews = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() });
    });
    return reviews;
  } catch (_err) {
    const colRef = collection(db, "reviews");
    const snapshot = await getDocs(colRef);
    const reviews = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() });
    });
    return reviews.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
}

export async function insertReview({ productId, name, rating, comment }) {
  const colRef = collection(db, "reviews");
  const reviewData = {
    product_id: String(productId),
    name: (name || "").trim(),
    rating: Number(rating) || 5,
    comment: (comment || "").trim(),
    created_at: new Date().toISOString(),
  };
  const docRef = await addDoc(colRef, reviewData);
  return { id: docRef.id, ...reviewData };
}

export async function deleteReview(id) {
  const docRef = doc(db, "reviews", String(id));
  await deleteDoc(docRef);
  return true;
}

// ─── STORAGE: UPLOAD PRODUCT IMAGE ───────────────────────────────────────────
export async function uploadProductImage(file, category) {
  if (!auth.currentUser) {
    throw new Error("Debes iniciar sesión para subir imágenes.");
  }

  const rawExt = file.name ? file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const ext = rawExt || "jpg";
  const slug = categoryToSlug(category);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `products/${slug}/${filename}`;

  const imageRef = storageRef(storage, path);
  await uploadBytes(imageRef, file, {
    contentType: file.type || "image/jpeg",
  });

  const downloadUrl = await getDownloadURL(imageRef);
  return downloadUrl;
}
