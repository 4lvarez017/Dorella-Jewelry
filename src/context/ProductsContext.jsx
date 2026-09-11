import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabaseFetch } from "../lib/supabase";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Carga inicial
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let data = [];
      // Paginar en lotes de 500 para evitar el límite max_rows de Supabase
      const PAGE = 500;
      let offset = 0;
      while (true) {
        const batch = await supabaseFetch(
          `/products?select=*&order=created_at.desc&limit=${PAGE}&offset=${offset}`
        );
        if (!batch || batch.length === 0) break;
        data = data.concat(batch);
        if (batch.length < PAGE) break;
        offset += PAGE;
      }

      // Dar formato a los productos (convertir a formato esperado por el frontend)
      const formatted = data.map((p) => {
        let imgs;
        try {
          imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch (_) {
          imgs = ["/placeholder.jpg"];
        }
        if (!Array.isArray(imgs) || imgs.length === 0) {
          imgs = ["/placeholder.jpg"];
        }

        return {
          ...p,
          image: imgs[0] || "/placeholder.jpg",
          images: imgs,
        };
      });

      setProducts(formatted);
      setLoadError(null);
    } catch (e) {
      console.error("Error al cargar productos de Supabase:", e);
      setLoadError(e.message || "Error al conectar con Supabase");
      // NO cargar datos locales silenciosamente.
      // Mantener los productos actuales (si los había) o dejar vacío.
      // El componente que consume debe mostrar el error.
    } finally {
      setLoading(false);
    }
  }, []);

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
      desc:     (newProduct.desc || "").trim(),
      stock:    newProduct.stock !== undefined ? Number(newProduct.stock) : 10,
      visible:  newProduct.visible !== false,
    };

    // Enviar a Supabase y esperar confirmación
    const result = await supabaseFetch("/products", {
      method: "POST",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify(productData),
    });

    // Verificar que se insertó correctamente
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new Error("Supabase no confirmó la inserción del producto");
    }

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

    // La tabla solo tiene columna "images" (array), NO tiene "image".
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      // ya tiene images correctas
    } else if (payload.image !== undefined && payload.images === undefined) {
      payload.images = [payload.image];
    }
    delete payload.image; // La columna "image" NO existe en Supabase

    await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Prefer": "return=representation" },
      body: JSON.stringify(payload),
    });

    // Recargar productos para sincronizar
    await loadProducts();
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
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
