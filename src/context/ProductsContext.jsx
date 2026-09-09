import { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as DEFAULT_PRODUCTS } from "../data/constants";
import { supabaseFetch } from "../lib/supabase";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  // Carga inicial
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      let data = [];
      try {
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
      } catch (err) {
        console.error("Error al obtener productos de Supabase:", err);
        throw err;
      }

      // Si la base de datos está vacía, la inicializamos con los productos por defecto
      if (!data || data.length === 0) {
        console.log("Base de datos vacía. Inicializando productos por defecto...");
        const initialProducts = DEFAULT_PRODUCTS.map((p) => {
          const imgs = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : [p.image || "/placeholder.jpg"];
          return {
            id: String(p.id),
            name: p.name,
            category: p.category,
            price: Number(p.price),
            images: imgs,
            desc: p.desc || "",
            stock: p.stock !== undefined ? Number(p.stock) : 12,
            visible: p.visible !== false,
          };
        });

        for (const prod of initialProducts) {
          try {
            await supabaseFetch("/products", {
              method: "POST",
              headers: { "Prefer": "return=representation" },
              body: JSON.stringify(prod),
            });
          } catch (insertErr) {
            console.error(`Error inicializando producto ${prod.name}:`, insertErr);
          }
        }

        // Volver a cargar para obtener el orden correcto
        data = await supabaseFetch("/products?select=*&order=created_at.desc");
      }

      // Dar formato a los productos (convertir a formato esperado por el frontend)
      const formatted = data.map((p) => {
        let imgs;
        try {
          imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
        } catch (_) {
          imgs = [p.image || "/placeholder.jpg"];
        }
        if (!Array.isArray(imgs) || imgs.length === 0) {
          imgs = [p.image || "/placeholder.jpg"];
        }

        return {
          ...p,
          image: imgs[0] || "/placeholder.jpg",
          images: imgs,
        };
      });

      setProducts(formatted);
    } catch (e) {
      console.error("Carga de fallback con productos locales:", e);
      setProducts(
        DEFAULT_PRODUCTS.map((p) => {
          const imgs = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : [p.image || "/placeholder.jpg"];
          return {
            ...p,
            image: imgs[0] || "/placeholder.jpg",
            images: imgs,
            stock: p.stock !== undefined ? Number(p.stock) : 12,
            visible: p.visible !== false,
          };
        })
      );
    }
  }

  // Agregar un producto nuevo
  const addProduct = async (newProduct) => {
    const id = newProduct.id || `custom-${Date.now()}`;
    const imgs = Array.isArray(newProduct.images) && newProduct.images.length > 0
      ? newProduct.images
      : [newProduct.image || "/placeholder.jpg"];

    const productData = {
      id,
      name:     newProduct.name,
      category: newProduct.category,
      price:    Number(newProduct.price),
      images:   imgs,           // Única columna de imagen que existe en Supabase
      desc:     newProduct.desc || "",
      stock:    newProduct.stock !== undefined ? Number(newProduct.stock) : 10,
      visible:  newProduct.visible !== false,
    };

    // Actualización optimista inmediata
    setProducts((prev) => [
      {
        ...productData,
        image: imgs[0] || "/placeholder.jpg",
      },
      ...prev,
    ]);

    try {
      await supabaseFetch("/products", {
        method: "POST",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify(productData),
      });

      loadProducts().catch(() => {});
    } catch (e) {
      console.error("Error al agregar producto en Supabase:", e);
      await loadProducts();
      throw e;
    }
  };

  // Modificar detalles de un producto (stock, precio, visibilidad, imágenes, etc.)
  const updateProduct = async (id, updatedFields) => {
    const payload = { ...updatedFields };
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    let finalImages = undefined;
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      finalImages = payload.images;
    } else if (payload.image !== undefined && payload.images === undefined) {
      finalImages = [payload.image];
    }
    if (finalImages) {
      payload.images = finalImages;
    }
    delete payload.image; // La columna "image" NO existe en Supabase

    // 1. Actualización optimista inmediata en el estado de React
    setProducts((prev) =>
      prev.map((p) => {
        if (String(p.id) !== String(id)) return p;
        const imgs = finalImages || p.images || [p.image || "/placeholder.jpg"];
        return {
          ...p,
          ...payload,
          images: imgs,
          image: imgs[0] || "/placeholder.jpg",
        };
      })
    );

    // 2. Persistir en Supabase
    try {
      await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify(payload),
      });

      // Sincronizar en segundo plano sin retrasar la respuesta al usuario
      loadProducts().catch(() => {});
    } catch (e) {
      console.error("Error al actualizar producto en Supabase:", e);
      await loadProducts();
      throw e;
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    // Actualización optimista inmediata
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));

    try {
      await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      loadProducts().catch(() => {});
    } catch (e) {
      console.error("Error al eliminar producto en Supabase:", e);
      await loadProducts();
      throw e;
    }
  };

  // Alternar visibilidad
  const toggleVisibility = async (id) => {
    const product = products.find((p) => String(p.id) === String(id));
    if (product) {
      await updateProduct(id, { visible: !product.visible });
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
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
