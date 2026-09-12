import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  fetchProducts as fbFetchProducts,
  addProduct as fbAddProduct,
  updateProduct as fbUpdateProduct,
  deleteProduct as fbDeleteProduct,
} from "../lib/firebase";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fbFetchProducts();

      // Dar formato a los productos (convertir a formato esperado por el frontend)
      const formatted = data.map((p) => {
        let imgs;
        try {
          imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch (_) {
          imgs = ["/placeholder.jpg"];
        }
        if (!Array.isArray(imgs) || imgs.length === 0) {
          imgs = [p.image || "/placeholder.jpg"];
        }

        return {
          ...p,
          image: imgs[0] || p.image || "/placeholder.jpg",
          images: imgs,
        };
      });

      setProducts(formatted);
      setLoadError(null);
    } catch (e) {
      console.error("Error al cargar productos de Firebase:", e);
      setLoadError(e.message || "Error al conectar con Firebase");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
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
