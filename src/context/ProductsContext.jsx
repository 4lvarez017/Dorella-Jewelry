import { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as DEFAULT_PRODUCTS } from "../data/constants";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  // Carga inicial y combinación de datos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      let added = [];
      try {
        const rawAdded = JSON.parse(localStorage.getItem("dorella_added_products") || "[]");
        added = Array.isArray(rawAdded) ? rawAdded.filter(p => p && typeof p === "object" && p.id) : [];
      } catch(_) {}

      let deletedIds = [];
      try {
        const rawDeleted = JSON.parse(localStorage.getItem("dorella_deleted_ids") || "[]");
        deletedIds = Array.isArray(rawDeleted) ? rawDeleted.map(id => String(id)) : [];
      } catch(_) {}

      let overrides = {};
      try {
        const rawOverrides = JSON.parse(localStorage.getItem("dorella_products_overrides") || "{}");
        overrides = (rawOverrides && typeof rawOverrides === "object") ? rawOverrides : {};
      } catch(_) {}

      // 1. Filtrar productos base y aplicar overrides
      const baseProcessed = DEFAULT_PRODUCTS.filter(
        (p) => p && !deletedIds.includes(String(p.id))
      ).map((p) => {
        const itemOverride = overrides[p.id] || {};
        return {
          ...p,
          stock: itemOverride.stock !== undefined ? itemOverride.stock : 12, // Stock por defecto
          visible: itemOverride.visible !== undefined ? itemOverride.visible : true,
          price: itemOverride.price !== undefined ? itemOverride.price : p.price,
          name: itemOverride.name !== undefined ? itemOverride.name : p.name,
          desc: itemOverride.desc !== undefined ? itemOverride.desc : p.desc,
          image: itemOverride.image !== undefined ? itemOverride.image : p.image,
        };
      });

      // 2. Procesar productos agregados por el usuario
      const addedProcessed = added.filter(
        (p) => p && !deletedIds.includes(String(p.id))
      ).map((p) => {
        const itemOverride = overrides[p.id] || {};
        return {
          ...p,
          stock: itemOverride.stock !== undefined ? itemOverride.stock : p.stock,
          visible: itemOverride.visible !== undefined ? itemOverride.visible : p.visible !== false,
          price: itemOverride.price !== undefined ? itemOverride.price : p.price,
          name: itemOverride.name !== undefined ? itemOverride.name : p.name,
          desc: itemOverride.desc !== undefined ? itemOverride.desc : p.desc,
          image: itemOverride.image !== undefined ? itemOverride.image : p.image,
        };
      });

      setProducts([...baseProcessed, ...addedProcessed]);
    } catch (e) {
      console.error("Error al cargar productos del almacenamiento local:", e);
      setProducts(DEFAULT_PRODUCTS.map(p => ({ ...p, stock: 12, visible: true })));
    }
  };

  // Agregar un producto nuevo
  const addProduct = (newProduct) => {
    try {
      const added = JSON.parse(localStorage.getItem("dorella_added_products") || "[]");
      const productWithDefaults = {
        id: `custom-${Date.now()}`,
        visible: true,
        stock: 10,
        ...newProduct,
      };
      
      const updatedAdded = [...added, productWithDefaults];
      localStorage.setItem("dorella_added_products", JSON.stringify(updatedAdded));
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Modificar detalles de un producto (stock, precio, visibilidad, etc.)
  const updateProduct = (id, updatedFields) => {
    try {
      // Si el producto es agregado, lo modificamos directamente en la lista de agregados
      const added = JSON.parse(localStorage.getItem("dorella_added_products") || "[]");
      const isAdded = added.some((p) => String(p.id) === String(id));

      if (isAdded) {
        const updatedAdded = added.map((p) =>
          String(p.id) === String(id) ? { ...p, ...updatedFields } : p
        );
        localStorage.setItem("dorella_added_products", JSON.stringify(updatedAdded));
      } else {
        // Si es un producto por defecto, guardamos los overrides
        const overrides = JSON.parse(localStorage.getItem("dorella_products_overrides") || "{}");
        overrides[id] = {
          ...(overrides[id] || {}),
          ...updatedFields,
        };
        localStorage.setItem("dorella_products_overrides", JSON.stringify(overrides));
      }
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Eliminar un producto
  const deleteProduct = (id) => {
    try {
      const deletedIds = JSON.parse(localStorage.getItem("dorella_deleted_ids") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem("dorella_deleted_ids", JSON.stringify(deletedIds));

      // Limpiar también de la lista de agregados si aplica
      const added = JSON.parse(localStorage.getItem("dorella_added_products") || "[]");
      const updatedAdded = added.filter((p) => String(p.id) !== String(id));
      localStorage.setItem("dorella_added_products", JSON.stringify(updatedAdded));

      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Alternar visibilidad
  const toggleVisibility = (id) => {
    const product = products.find((p) => String(p.id) === String(id));
    if (product) {
      updateProduct(id, { visible: !product.visible });
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
        reloadProducts: loadProducts
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
