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
        data = await supabaseFetch("/products?select=*&order=created_at.desc");
      } catch (err) {
        console.error("Error al obtener productos de Supabase:", err);
        throw err;
      }

      // Si la base de datos está vacía, la inicializamos con los productos por defecto
      if (!data || data.length === 0) {
        console.log("Base de datos vacía. Inicializando productos por defecto...");
        const initialProducts = DEFAULT_PRODUCTS.map((p) => ({
          id: String(p.id),
          name: p.name,
          category: p.category,
          price: Number(p.price),
          images: [p.image || "/placeholder.jpg"],
          desc: p.desc || "",
          stock: 12,
          visible: true,
        }));

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
        if (!Array.isArray(imgs)) {
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
        DEFAULT_PRODUCTS.map((p) => ({
          ...p,
          image: p.image || "/placeholder.jpg",
          images: [p.image || "/placeholder.jpg"],
          stock: 12,
          visible: true,
        }))
      );
    }
  }

  // Agregar un producto nuevo
  const addProduct = async (newProduct) => {
    try {
      const id = `custom-${Date.now()}`;
      const imgs = Array.isArray(newProduct.images)
        ? newProduct.images
        : [newProduct.image || "/placeholder.jpg"];

      const productData = {
        id,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        images: imgs,
        desc: newProduct.desc || "",
        stock: newProduct.stock !== undefined ? Number(newProduct.stock) : 10,
        visible: newProduct.visible !== false,
      };

      await supabaseFetch("/products", {
        method: "POST",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify(productData),
      });

      await loadProducts();
    } catch (e) {
      console.error("Error al agregar producto en Supabase:", e);
    }
  };

  // Modificar detalles de un producto (stock, precio, visibilidad, etc.)
  const updateProduct = async (id, updatedFields) => {
    try {
      const payload = { ...updatedFields };
      if (payload.price !== undefined) payload.price = Number(payload.price);
      if (payload.stock !== undefined) payload.stock = Number(payload.stock);

      // Si se pasa image individual, la convertimos a primer elemento de images
      if (payload.image !== undefined && payload.images === undefined) {
        payload.images = [payload.image];
        delete payload.image;
      }

      await supabaseFetch(`/products?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await loadProducts();
    } catch (e) {
      console.error("Error al actualizar producto en Supabase:", e);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    try {
      await supabaseFetch(`/products?id=eq.${id}`, {
        method: "DELETE",
      });
      await loadProducts();
    } catch (e) {
      console.error("Error al eliminar producto en Supabase:", e);
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
