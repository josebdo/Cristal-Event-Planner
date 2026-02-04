import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // Format price
  const formattedPrice = product.price
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(product.price)
    : ""

  return (
    <Card
      className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent">
            <span className="font-serif text-4xl text-primary/30">D</span>
          </div>
        )}
        {product.is_promotion && product.promotion_text && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            {product.promotion_text}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif text-lg font-medium text-foreground">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
        {formattedPrice && (
          <p className="mt-2 text-sm font-semibold text-primary">
            {formattedPrice}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
