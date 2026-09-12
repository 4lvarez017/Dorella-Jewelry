import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, writeBatch, doc, collection, getDocs } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env si existe
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {
    console.warn("No se pudo cargar .env automáticamente:", e.message);
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("\n❌ ERROR: Faltan credenciales de Firebase en el archivo .env.");
  console.error("Asegúrate de copiar .env.example a .env y configurar VITE_FIREBASE_API_KEY y VITE_FIREBASE_PROJECT_ID.\n");
  process.exit(1);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function loadAllLocalProducts() {
  const productsDir = path.join(__dirname, "src", "data", "products");
  const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".js"));

  let allProducts = [];
  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const mod = await import(fileUrl);
    for (const key of Object.keys(mod)) {
      if (Array.isArray(mod[key])) {
        allProducts = allProducts.concat(mod[key]);
      }
    }
  }
  return allProducts;
}

async function syncToFirebase() {
  console.log("==================================================");
  console.log("🔥 SINCRONIZACIÓN DE CATÁLOGO HACIA FIREBASE FIRESTORE");
  console.log("==================================================");
  console.log(`Proyecto: ${firebaseConfig.projectId}`);

  try {
    const localProducts = await loadAllLocalProducts();
    console.log(`📦 Encontrados ${localProducts.length} productos en archivos locales.`);

    const productsCol = collection(db, "products");
    console.log("📥 Consultando colección actual en Firestore...");
    const existingSnap = await getDocs(productsCol);
    console.log(`ℹ️ Productos existentes en Firestore: ${existingSnap.size}`);

    console.log("🚀 Subiendo productos en lotes atómicos (batches de 450)...");
    const BATCH_SIZE = 450; // Límite de Firestore es 500 operaciones por batch
    let batch = writeBatch(db);
    let count = 0;
    let totalCommitted = 0;

    const seenIds = new Set();

    for (const p of localProducts) {
      let id = String(p.id);
      if (seenIds.has(id)) {
        id = `${id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      seenIds.add(id);

      const imgs = Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : [p.image || "/placeholder.jpg"];

      const productDoc = {
        id,
        name: (p.name || "").trim(),
        category: (p.category || "General").trim(),
        price: Number(p.price) || 0,
        images: imgs,
        image: imgs[0] || "/placeholder.jpg",
        desc: (p.desc || "").trim(),
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        visible: p.visible !== false,
        updated_at: new Date().toISOString(),
      };

      const docRef = doc(db, "products", id);
      batch.set(docRef, productDoc, { merge: true });
      count++;

      if (count >= BATCH_SIZE) {
        await batch.commit();
        totalCommitted += count;
        console.log(`   ✓ Sincronizados ${totalCommitted} productos...`);
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      totalCommitted += count;
      console.log(`   ✓ Sincronizados ${totalCommitted} productos...`);
    }

    console.log("\n==================================================");
    console.log(`✨ ¡Sincronización completada! Total: ${totalCommitted} productos en Firestore.`);
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error durante la sincronización a Firebase:", error);
    process.exit(1);
  }
}

syncToFirebase();
