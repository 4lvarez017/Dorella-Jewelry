import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  fetchProducts as fbFetchProducts,
  addProduct as fbAddProduct,
  updateProduct as fbUpdateProduct,
  deleteProduct as fbDeleteProduct,
  updateProductsOrderBatch as fbUpdateProductsOrderBatch,
} from "../lib/firebase";
import { PRODUCTS as FALLBACK_PRODUCTS } from "../data/constants";

function getInitialProducts() {
  try {
    const cached = localStorage.getItem("dorella_products_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return (FALLBACK_PRODUCTS || []).map((p) => {
    let imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/placeholder.jpg"];
    return {
      ...p,
      image: imgs[0] || "/placeholder.jpg",
      images: imgs,
      order: p.order !== undefined && p.order !== null ? Number(p.order) : 999999,
    };
  });
}

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(getInitialProducts);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await fbFetchProducts();
      if (!Array.isArray(data) || data.length === 0) return;

      // Dar formato a los productos (convertir a formato esperado por el frontend)
      const formatted = data.map((p) => {
        let imgs;
        try {
          imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch {
          imgs = ["/placeholder.jpg"];
        }
        if (!Array.isArray(imgs) || imgs.length === 0) {
          imgs = [p.image || "/placeholder.jpg"];
        }

        return {
          ...p,
          image: imgs[0] || p.image || "/placeholder.jpg",
          images: imgs,
          order: p.order !== undefined && p.order !== null ? Number(p.order) : 999999,
        };
      });

      // Ordenar por 'order' ascendente, fallback alfabético
      formatted.sort((a, b) => {
        const ordA = a.order !== undefined ? Number(a.order) : 999999;
        const ordB = b.order !== undefined ? Number(b.order) : 999999;
        if (ordA !== ordB) return ordA - ordB;
        return (a.name || "").localeCompare(b.name || "", "es");
      });

      setProducts(formatted);
      try {
        localStorage.setItem("dorella_products_cache", JSON.stringify(formatted));
      } catch {
        // ignore
      }
      setLoadError(null);
    } catch (e) {
      console.error("Error al sincronizar productos de Firebase:", e);
      // No bloquea la UI si ya tenemos productos iniciales
      if (!products || products.length === 0) {
        setLoadError(e.message || "Error al conectar con Firebase");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial / sincronización en segundo plano
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Agregar un producto nuevo
  const addProduct = async (newProduct) => {
    const id = newProduct.id || `custom-${Date.now()}`;
    const imgs = Array.isArray(newProduct.images) && newProduct.images.length > 0
      ? newProduct.images
      : [newProduct.image || "/placeholder.jpg"];

    const productData = {
      id,
      name:     (newProduct.name || "").trim(),
      category: (newProduct.category || "Anillos").trim(),
      price:    Number(newProduct.price),
      images:   imgs,
      image:    imgs[0] || "/placeholder.jpg",
      desc:     (newProduct.desc || "").trim(),
      stock:    newProduct.stock !== undefined ? Number(newProduct.stock) : 10,
      visible:  newProduct.visible !== false,
    };

    await fbAddProduct(productData);

    // Recargar productos para sincronizar
    await loadProducts();
  };

  // Modificar detalles de un producto (stock, precio, visibilidad, imágenes, etc.)
  const updateProduct = async (id, updatedFields) => {
    const payload = { ...updatedFields };
    if (payload.name !== undefined) payload.name = (payload.name || "").trim();
    if (payload.category !== undefined) payload.category = (payload.category || "").trim();
    if (payload.desc !== undefined) payload.desc = (payload.desc || "").trim();
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.image = payload.images[0];
    } else if (payload.image !== undefined && payload.images === undefined) {
      payload.images = [payload.image];
    }

    await fbUpdateProduct(id, payload);

    // Recargar productos para sincronizar
    await loadProducts();
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    await fbDeleteProduct(id);
    await loadProducts();
  };

  // Alternar visibilidad
  const toggleVisibility = async (id) => {
    const product = products.find((p) => String(p.id) === String(id));
    if (!product) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }
    await updateProduct(id, { visible: !product.visible });
  };

  // Reordenar productos (optimista + persistencia atómica en Firestore)
  const reorderProducts = async (newOrderedList) => {
    // 1. Asignar orden secuencial basado en la nueva posición
    const orderUpdates = newOrderedList.map((p, index) => ({
      id: p.id,
      order: index + 1,
    }));

    const orderMap = new Map(orderUpdates.map((u) => [String(u.id), u.order]));

    // 2. Actualización optimista en el estado de React y caché local
    let updatedSorted = [];
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const strId = String(p.id);
        if (orderMap.has(strId)) {
          return { ...p, order: orderMap.get(strId) };
        }
        return p;
      });

      updatedSorted = updated.sort((a, b) => {
        const ordA = a.order !== undefined ? Number(a.order) : 999999;
        const ordB = b.order !== undefined ? Number(b.order) : 999999;
        if (ordA !== ordB) return ordA - ordB;
        return (a.name || "").localeCompare(b.name || "", "es");
      });

      try {
        localStorage.setItem("dorella_products_cache", JSON.stringify(updatedSorted));
      } catch {
        // ignore
      }

      return updatedSorted;
    });

    // 3. Persistir en Firestore en segundo plano (lote atómico)
    await fbUpdateProductsOrderBatch(orderUpdates);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        loadError,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleVisibility,
        reorderProducts,
        reloadProducts: loadProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de un ProductsProvider");
  }
  return context;
};
