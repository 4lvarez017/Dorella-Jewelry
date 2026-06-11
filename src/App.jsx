import { useState, useEffect, lazy, Suspense } from "react";
import { CartProvider } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { globalCSS, G } from "./styles/theme";
import { HomeView } from "./pages/HomeView";
import { CatalogView } from "./pages/CatalogView";
import { ProductDetailView } from "./pages/ProductDetailView";
import { PRODUCTS } from "./data/constants";
import { getSession, signOut } from "./lib/supabase";

// ── Carga diferida del Admin
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").then(m => ({ default: m.AdminLogin })));

function AdminFallback() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: G.cream, flexDirection: "column", gap: 20,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid rgba(201,168,76,0.15)`,
        borderTopColor: G.gold,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "3px",
        textTransform: "uppercase", color: G.textMuted }}>
        Cargando panel...
      </p>
    </div>
  );
}


export default function App() {
  const [page, setPage] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Verificar sesión real con Supabase al inicio
  useEffect(() => {
    getSession().then(session => {
      setAdminLoggedIn(!!session);
      setSessionChecked(true);
    });
  }, []);

  const [adminTab, setAdminTab] = useState("dashboard");
  // NOTE: category selection for Inventario/Productos is now internal to AdminPanel

  // Scroll al inicio automático ante cambios de página o categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, activeCategory]);

  // Leer estado inicial de la URL y sincronizar History API
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = params.get("page") || "home";
    const urlCategory = params.get("category") || "Todos";
    const urlProductId = params.get("productId");
    const urlTab = params.get("tab") || "dashboard";
    const urlAdminCategory = params.get("adminCategory") || null;

    setPage(urlPage);
    setActiveCategory(urlCategory);
    setAdminTab(urlTab);

    if (urlProductId) {
      const prod = PRODUCTS.find((p) => String(p.id) === String(urlProductId));
      if (prod) {
        setSelectedProduct(prod);
      }
    }

    // Inicializar el estado de historia para la URL actual
    window.history.replaceState(
      { 
        page: urlPage, 
        category: urlCategory, 
        productId: urlProductId,
        tab: urlTab,
      },
      "",
      window.location.search || `?page=${urlPage}`
    );

    const handlePopState = (e) => {
      if (e.state) {
        setPage(e.state.page || "home");
        setActiveCategory(e.state.category || "Todos");
        setAdminTab(e.state.tab || "dashboard");

        if (e.state.productId) {
          const prod = PRODUCTS.find((p) => String(p.id) === String(e.state.productId));
          setSelectedProduct(prod || null);
        } else {
          setSelectedProduct(null);
        }
      } else {
        // Fallback por defecto
        setPage("home");
        setActiveCategory("Todos");
        setSelectedProduct(null);
        setAdminTab("dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Función para navegar y empujar historial
  const navigateTo = (newPage, newCategory = null, newProduct = null, tab = null) => {
    const nextCategory = newCategory !== null ? newCategory : activeCategory;
    const nextProduct = newProduct !== null ? newProduct : selectedProduct;
    const nextTab = tab !== null ? tab : adminTab;
    
    setPage(newPage);
    if (newCategory !== null) setActiveCategory(newCategory);
    if (newProduct !== null) setSelectedProduct(newProduct);
    if (tab !== null) setAdminTab(tab);

    // Actualizar parámetros de la URL
    const params = new URLSearchParams();
    params.set("page", newPage);
    
    if (newPage === "catalog" && nextCategory !== "Todos") {
      params.set("category", nextCategory);
    }
    if (newPage === "product" && nextProduct) {
      params.set("productId", nextProduct.id);
    }
    if (newPage === "admin") {
      params.set("tab", nextTab);
    }
    
    window.history.pushState(
      { 
        page: newPage, 
        category: nextCategory, 
        productId: nextProduct ? nextProduct.id : null,
        tab: nextTab,
      },
      "",
      `?${params.toString()}`
    );
  };

  const handleViewDetails = (product) => {
    navigateTo("product", null, product);
  };

  return (
    <>
      {/* Estilos globales inyectados una sola vez */}
      <style>{globalCSS}</style>

      <ProductsProvider>
        <CartProvider>
          {page === "admin" ? (
            <Suspense fallback={<AdminFallback />}>
              {adminLoggedIn ? (
                <AdminPanel
                  activeTab={adminTab}
                  setActiveTab={(tab) => navigateTo("admin", null, null, tab)}
                  onLogout={async () => {
                    await signOut();
                    setAdminLoggedIn(false);
                    navigateTo("home", "Todos", null);
                  }}
                />
              ) : (
                <AdminLogin onLogin={() => {
                  setAdminLoggedIn(true);
                }} />
              )}
            </Suspense>

          ) : page === "product" ? (
            <ProductDetailView
              setPage={(p) => navigateTo(p)}
              product={selectedProduct}
            />
          ) : page === "catalog" ? (
            <CatalogView
              setPage={(p) => navigateTo(p)}
              activeCategory={activeCategory}
              setActiveCategory={(c) => navigateTo("catalog", c, null)}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <HomeView
              setPage={(p) => navigateTo(p)}
              onSelectCategory={(c) => navigateTo("catalog", c, null)}
              onViewDetails={handleViewDetails}
            />
          )}
        </CartProvider>
      </ProductsProvider>
    </>
  );
}

