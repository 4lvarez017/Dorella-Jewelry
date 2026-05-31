import { G } from "../styles/theme";
import { useProducts } from "../context/ProductsContext";
import { ProductCard } from "./ProductCard";

export function CatalogSection({ activeCategory, id, onViewDetails }) {
  const { products } = useProducts();

  // Mostrar solo productos visibles al público
  const visibleProducts = products.filter((p) => p.visible !== false);

  const filteredProducts =
    activeCategory === "Todos"
      ? visibleProducts
      : visibleProducts.filter((p) => p.category.startsWith(activeCategory));

  const isDark =
    activeCategory.includes("Hombre") ||
    activeCategory.includes("Pareja") ||
    activeCategory.includes("Niños");

  return (
    <section
      id={id}
      style={{
        background: "transparent",
        padding: "40px 40px 80px",
        minHeight: "400px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: G.gold }}>
            <p className="serif" style={{ fontSize: "24px" }}>
              Próximamente en esta categoría...
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                dark={isDark} 
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
