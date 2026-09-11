import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../src/lib/supabase.js";

async function run() {
  console.log("==================================================");
  console.log("🔒 PRUEBAS DE SEGURIDAD POSTGREST / RLS (ANON)");
  console.log("==================================================");
  console.log(`Endpoint: ${SUPABASE_URL}`);

  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  // Test 1: Lectura pública de productos (debe funcionar)
  console.log("\n1. Probando GET /products (Público)...");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,price,category&limit=3`, { headers });
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`   ✅ Éxito: Se leyeron ${data.length} productos con rol anon.`);
    } else {
      console.log(`   ℹ️ Respuesta: ${await res.text()}`);
    }
  } catch (err) {
    console.log(`   ❌ Error de conexión: ${err.message}`);
  }

  // Test 2: Intento de DELETE no autorizado en products
  console.log("\n2. Probando DELETE /products?id=eq.test-unauthorized (Debe fallar o bloquearse)...");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.test-unauthorized`, {
      method: "DELETE",
      headers,
    });
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      console.log("   ✅ Correcto: PostgREST bloqueó la eliminación no autorizada.");
    } else if (res.status === 204) {
      console.log("   ⚠️ Advertencia: Si RLS aún no se ha ejecutado en Supabase, la política permisiva anterior respondió 204.");
      console.log("      Asegúrate de ejecutar 'supabase/migrations/001_products_rls.sql' en el Dashboard de Supabase.");
    }
  } catch (err) {
    console.log(`   ℹ️ Excepción: ${err.message}`);
  }

  // Test 3: Intento de lectura no autorizada de orders
  console.log("\n3. Probando GET /orders (Debe estar protegido contra lectura anónima tras aplicar RLS)...");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?limit=3`, { headers });
    console.log(`   Status: ${res.status} ${res.statusText}`);
    if (res.status === 401 || res.status === 403) {
      console.log("   ✅ Correcto: La lectura de pedidos de clientes está bloqueada para usuarios anónimos.");
    } else if (res.ok) {
      const data = await res.json();
      if (data.length === 0) {
        console.log("   ✅ RLS activo: El usuario anónimo no tiene acceso a filas de pedidos.");
      } else {
        console.log("   ⚠️ Alerta: Se devolvieron pedidos a usuario anónimo.");
        console.log("      Ejecuta 'supabase/migrations/002_orders_rls.sql' para proteger los datos de clientes.");
      }
    }
  } catch (err) {
    console.log(`   ℹ️ Excepción: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log("🏁 PRUEBAS DE SEGURIDAD FINALIZADAS");
  console.log("==================================================");
}

run().catch(err => {
  console.error("Error en pruebas RLS:", err);
  process.exit(1);
});
