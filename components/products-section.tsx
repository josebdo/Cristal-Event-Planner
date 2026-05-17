"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"
import type { Category, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ProductsSectionProps {
  categories?: Category[]
  products: Product[]
  title?: string
  whatsappNumber?: string
}

export function ProductsSection({ categories = [], products, title = "Nuestros Productos", whatsappNumber }: ProductsSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")

  // Filtrar productos según la categoría seleccionada
  const filteredProducts = selectedCategoryId === "all"
    ? products
    : products.filter((p) => p.category_id === selectedCategoryId)

  // Solo mostrar categorías que tengan al menos un producto activo
  const activeCategories = categories.filter((cat) =>
    products.some((p) => p.category_id === cat.id)
  )

  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground">
            Cada creación está hecha con amor y dedicación
          </p>
        </div>

        {/* Pestañas de Filtrado por Categoría */}
        {activeCategories.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center justify-center gap-2 border-b border-border/60 pb-6">
            <Button
              variant={selectedCategoryId === "all" ? "default" : "ghost"}
              onClick={() => setSelectedCategoryId("all")}
              className="rounded-full px-6 transition-all"
            >
              Todos los Productos
            </Button>
            {activeCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "ghost"}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="rounded-full px-6 transition-all"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Unified Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 transition-all duration-500">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-card rounded-2xl border border-border shadow-sm">
            <p className="text-lg text-muted-foreground">
              No se encontraron productos disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={whatsappNumber}
      />
    </section>
  )
}
