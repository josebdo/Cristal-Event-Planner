"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"
import type { Category, Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductsSectionProps {
  categories?: Category[]
  products: Product[]
  title?: string
  whatsappNumber?: string
}

export function ProductsSection({ categories = [], products, title = "Nuestros Productos", whatsappNumber }: ProductsSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // We need a way to get the WhatsApp number. Often passed via props or context.
  // For now let's assume it might be passed or default.
  // Ideally, the parent page passes `settings` including whatsapp number.
  // But updating that chain is complex. Let's use a hardcoded fallback or try to read it if updated.
  // Actually, HeroSection had it. Let's see if we can update ProductsSection props later or now.
  // For now, let's leave it as optional/default.

  return (
    <section id="productos" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Nuestros Productos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Cada creación está hecha con amor y dedicación
          </p>
        </div>

        {categories.length > 0 ? (
          categories.map((category, index) => {
            const categoryProducts = products.filter(
              (p) => p.category_id === category.id
            )

            if (categoryProducts.length === 0) return null

            return (
              <div
                key={category.id}
                className={cn("mb-16 last:mb-0", index > 0 && "pt-8")}
              >
                <div className="mb-8">
                  <h3 className="font-serif text-2xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Pronto agregaremos productos a nuestro catálogo.
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
